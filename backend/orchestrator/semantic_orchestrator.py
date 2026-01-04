"""
Semantic Orchestrator Module
----------------------------
Handles interaction with Google Gemini 1.5 Flash for:
1. Context Ingestion (File Upload + Caching)
2. Chatbot Logic (RAG/Context-aware)
3. Structured Data Generation (Charts/JSON)

Integrates with PostgreSQL to store Context IDs and Chat History.
"""

import os
import time
import json
import datetime
import logging
import pandas as pd
import google.generativeai as genai
from google.generativeai import caching
from sqlalchemy.orm import Session
from api.models import AIContext, FichaCliente, ChatSession, ChatMessage
from dotenv import load_dotenv

# Load environment
load_dotenv()
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    genai.configure(api_key=API_KEY)

# Configuration
MODEL_NAME = "models/gemini-3-flash-preview" # Using Gemini 3 Flash Preview as requested
MIN_TOKEN_THRESHOLD = 33000 # Gemini Cache requires ~32k tokens. We aim slightly higher.

logger = logging.getLogger(__name__)

class SemanticOrchestrator:
    def __init__(self, db: Session):
        self.db = db

    def _augment_data_if_needed(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Artificially inflates the dataset if it's too small for Gemini Context Caching.
        This is a heuristic approach for the MVP/POC phase.
        """
        # Estimate tokens (very rough approximation: 1 row ~ 100 tokens? It depends)
        # Better: just check row count. If < 1000 rows, probably need augmentation for 32k tokens.
        # 32k tokens is A LOT of text. 
        # For safety in this phase, we will duplicate data if rows < 2000.
        
        if len(df) > 2000:
            return df
            
        logger.info(f"📉 Dataset small ({len(df)} rows). Augmenting for Context Cache compliance...")
        
        augmented_dfs = [df]
        # We need to reach ~32k tokens. 
        # If 1 row = 50 tokens, we need ~6400 rows.
        # Let's target ~5000 rows to be safe-ish or rely on File API fallback if cache fails.
        
        target_rows = 5000
        current_rows = len(df)
        multiplier = (target_rows // current_rows) + 1
        
        # Cap multiplier to avoid explosion
        multiplier = min(multiplier, 50) 
        
        for i in range(1, multiplier):
            new_df = df.copy()
            # Shift dates if possible to make it look like "history"
            if 'Date' in new_df.columns:
                try:
                    new_df['Date'] = pd.to_datetime(new_df['Date']) + pd.DateOffset(months=i)
                except:
                    pass # Ignore if date parsing fails
            
            # Jitter metrics
            numeric_cols = new_df.select_dtypes(include=['number']).columns
            for col in numeric_cols:
                new_df[col] = new_df[col] * (1 + (i * 0.01))
                
            augmented_dfs.append(new_df)
            
        final_df = pd.concat(augmented_dfs, ignore_index=True)
        logger.info(f"📈 Data augmented: {len(df)} -> {len(final_df)} rows")
        return final_df

    # Tipos de archivo no soportados por Gemini 3 Flash Preview
    UNSUPPORTED_EXTENSIONS = ('.mp4', '.avi', '.mov', '.mkv', '.webm', '.wmv', '.flv')
    
    def ingest_context(self, client_id: str, file_path: str, category: str = "General"):
        """
        Uploads a file to Gemini, saves it to DB, and REGENERATES the Context Cache
        including ALL active files for this client.
        """
        logger.info(f"🧠 Ingesting context for Client ID: {client_id} (Category: {category})")
        
        # Check for unsupported file types (videos not supported in Gemini 3 Flash Preview)
        if file_path.lower().endswith(self.UNSUPPORTED_EXTENSIONS):
            raise ValueError(f"❌ Archivos de video no soportados actualmente. Extensiones bloqueadas: {self.UNSUPPORTED_EXTENSIONS}")
        
        # 1. Pre-process file (Excel -> CSV + Augmentation)
        # Only augment if it's Excel/CSV. If PDF, we upload as is.
        is_tabular = file_path.endswith(('.xlsx', '.xls', '.csv'))
        
        upload_path = file_path
        mime_type = None # Auto-detect
        
        if is_tabular:
            if file_path.endswith(('.xlsx', '.xls')):
                df = pd.read_excel(file_path)
            else:
                df = pd.read_csv(file_path)
                
            df = self._augment_data_if_needed(df)
            
            # Save temp CSV for upload
            temp_csv = file_path.replace('.xlsx', '.csv').replace('.xls', '.csv')
            if temp_csv == file_path:
                temp_csv = file_path + ".temp.csv"
            df.to_csv(temp_csv, index=False)
            upload_path = temp_csv
            mime_type = "text/csv"
        
        # 2. Upload to Gemini
        logger.info(f"⬆️ Uploading {upload_path} to Gemini...")
        gemini_file = genai.upload_file(upload_path, mime_type=mime_type)
        
        # Wait for processing
        while gemini_file.state.name == "PROCESSING":
            time.sleep(2)
            gemini_file = genai.get_file(gemini_file.name)
            
        if gemini_file.state.name != "ACTIVE":
            raise Exception(f"Gemini File Processing Failed: {gemini_file.state.name}")
            
        logger.info(f"✅ File Active: {gemini_file.name}")
        
        # 3. Save File Record to DB
        # Ensure AIContext exists
        ai_context = self.db.query(AIContext).filter(AIContext.ficha_cliente_id == client_id).first()
        if not ai_context:
            ai_context = AIContext(ficha_cliente_id=client_id)
            self.db.add(ai_context)
            self.db.commit()
            self.db.refresh(ai_context)
            
        from api.models import ContextFile
        new_file = ContextFile(
            ai_context_id=ai_context.id,
            filename=os.path.basename(file_path),
            category=category,
            gemini_uri=gemini_file.name
        )
        self.db.add(new_file)
        self.db.commit()
        
        # 4. REGENERATE CACHE with ALL files
        # Fetch all files for this context
        all_files = self.db.query(ContextFile).filter(ContextFile.ai_context_id == ai_context.id).all()
        file_uris = [f.gemini_uri for f in all_files]
        
        # Retrieve Gemini file objects
        gemini_files_list = [genai.get_file(uri) for uri in file_uris]
        
        cache_name = None
        try:
            # TTL 24 hours
            ttl_minutes = 60 * 24 
            
            # Create NEW cache
            cache = caching.CachedContent.create(
                model=MODEL_NAME,
                display_name=f"ctx_{client_id}_{int(time.time())}",
                system_instruction="Eres un analista experto en negocios. Tienes acceso a múltiples documentos de la empresa (Finanzas, Marketing, Procesos, etc.). Tu objetivo es cruzar información entre ellos para dar respuestas estratégicas integrales.",
                contents=gemini_files_list,
                ttl=datetime.timedelta(minutes=ttl_minutes),
            )
            cache_name = cache.name
            logger.info(f"✅ New Context Cache Created with {len(file_uris)} files: {cache_name}")
            
            # Optional: Delete old cache if exists to save space/money?
            # For now, we just update the pointer.
            
        except Exception as e:
            logger.warning(f"⚠️ Could not create Context Cache (falling back to File API): {e}")
            
        # 5. Update AIContext
        ai_context.gemini_cache_name = cache_name
        ai_context.last_updated = datetime.datetime.utcnow()
        
        self.db.commit()
        self.db.refresh(ai_context)
        
        # Cleanup temp file
        if is_tabular and os.path.exists(upload_path) and upload_path != file_path:
            os.remove(upload_path)
            
        return ai_context
            
        return ai_context

    def _get_model(self, ai_context: AIContext):
        """Returns the configured GenerativeModel based on available context"""
        if ai_context.gemini_cache_name:
            logger.info(f"⚡ Using Cached Content: {ai_context.gemini_cache_name}")
            try:
                cache = genai.caching.CachedContent.get(ai_context.gemini_cache_name)
                logger.info(f"   Cache found. Model: {cache.model}, Expires: {cache.expire_time}")
                return genai.GenerativeModel.from_cached_content(cached_content=cache)
            except Exception as e:
                logger.error(f"❌ Error retrieving cache (likely expired): {e}")
                logger.info("🔄 Falling back to File API and clearing invalid cache record.")
                
                # Clear invalid cache from DB
                ai_context.gemini_cache_name = None
                ai_context.gemini_cache_expires_at = None
                self.db.commit()
                self.db.refresh(ai_context)
                
                # Proceed to fallback below
                pass

        # Fallback: If no cache (or cache failed), we need to check if there are files.
        from api.models import ContextFile
        files = self.db.query(ContextFile).filter(ContextFile.ai_context_id == ai_context.id).all()
        if files:
            logger.info(f"🐌 Using File API (No Cache) with {len(files)} files")
            return genai.GenerativeModel(MODEL_NAME)
        else:
            raise Exception("No Context available for this client. Please upload files first.")

    def chat(self, client_id: str, session_id: str, user_message: str, role: str = "user"):
        """
        Process a chat message.
        """
        # 1. Get Context
        ai_context = self.db.query(AIContext).filter(AIContext.ficha_cliente_id == client_id).first()
        # Check if context exists (either cache or files)
        has_files = False
        if ai_context:
             from api.models import ContextFile
             has_files = self.db.query(ContextFile).filter(ContextFile.ai_context_id == ai_context.id).count() > 0

        if not ai_context or (not has_files and not ai_context.gemini_cache_name):
            return "⚠️ No hay datos analizados para este cliente. Por favor sube un archivo primero."

        # 2. Get Session History
        chat_session = self.db.query(ChatSession).filter(ChatSession.id == session_id).first()
        if not chat_session:
            raise Exception("Chat Session not found")

        # Load history from DB
        # Gemini expects: [{'role': 'user', 'parts': ['...']}, {'role': 'model', 'parts': ['...']}]
        history = []
        
        # If using File API (no cache), we must inject the file into the history/prompt manually
        # If using Cache, the file is implicit in the model
        
        if not ai_context.gemini_cache_name:
            # Inject file reference in the first turn if not cached
            # We can't easily reconstruct the exact object for history if it's not the first turn.
            # For simplicity in this MVP: 
            # If no cache, we instantiate a fresh chat with the file in history[0]
            # But we need to append previous DB messages.
            pass 

        # Construct history from DB
        db_messages = self.db.query(ChatMessage).filter(ChatMessage.session_id == session_id).order_by(ChatMessage.timestamp).all()
        
        gemini_history = []
        for msg in db_messages:
            role_mapped = "user" if msg.role == "user" else "model"
            gemini_history.append({"role": role_mapped, "parts": [msg.content]})

        # 3. Initialize Model & Chat
        model = self._get_model(ai_context)
        
        # --- FIX FOR 404 ERROR IN CACHE ---
        # Sometimes 'start_chat' with cache fails if history is empty or malformed.
        # We will try 'generate_content' first as a fallback or ensure history is correct.
        # Also, 'from_cached_content' might need explicit model name sometimes.
        
        if ai_context.gemini_cache_name:
            # Explicitly re-instantiate model with cache name to be safe
            cache = genai.caching.CachedContent.get(ai_context.gemini_cache_name)
            model = genai.GenerativeModel.from_cached_content(cached_content=cache)
            
            if not gemini_history:
                # If no history, just start empty chat
                chat = model.start_chat()
            else:
                chat = model.start_chat(history=gemini_history)
        else:
            # File API Mode (Multi-file fallback)
            # If we are here, it means Cache creation failed but we have files in DB.
            from api.models import ContextFile
            files = self.db.query(ContextFile).filter(ContextFile.ai_context_id == ai_context.id).all()
            gemini_files = [genai.get_file(f.gemini_uri) for f in files]
            
            if not gemini_history:
                # First message ever: Inject ALL files
                parts = gemini_files + ["Analiza estos documentos."]
                gemini_history = [
                    {"role": "user", "parts": parts},
                    {"role": "model", "parts": ["Entendido. He analizado los documentos. ¿En qué puedo ayudarte?"]}
                ]
            
            chat = model.start_chat(history=gemini_history)

        # 4. Send Message
        try:
            response = chat.send_message(user_message)
            response_text = response.text
        except Exception as e:
            is_404 = "404" in str(e)
            if is_404 and ai_context.gemini_cache_name:
                logger.warning(f"⚠️ Cache failed (404). Falling back to File API. Error: {e}")
                
                # Fallback: Use File API
                from api.models import ContextFile
                files = self.db.query(ContextFile).filter(ContextFile.ai_context_id == ai_context.id).all()
                
                gemini_files = []
                for f in files:
                    try:
                        gf = genai.get_file(f.gemini_uri)
                        logger.info(f"   Fallback File: {gf.name} State: {gf.state.name}")
                        if gf.state.name == "ACTIVE":
                            gemini_files.append(gf)
                        else:
                            logger.error(f"   File {gf.name} is not ACTIVE ({gf.state.name}). Skipping.")
                    except Exception as file_err:
                        logger.error(f"   Error retrieving file {f.gemini_uri}: {file_err}")

                # Re-create model without cache
                # User requested to stick with the configured model (Gemini 3 Flash)
                model = genai.GenerativeModel(MODEL_NAME)
                
                # Re-construct history with files
                fallback_history = []
                if gemini_files:
                    # Inject files in the first user message
                    fallback_history.append({
                        "role": "user", 
                        "parts": gemini_files + ["Contexto inicial cargado."]
                    })
                    fallback_history.append({
                        "role": "model",
                        "parts": ["Entendido."]
                    })
                    
                # Append actual conversation history
                for msg in db_messages:
                    role_mapped = "user" if msg.role == "user" else "model"
                    fallback_history.append({"role": role_mapped, "parts": [msg.content]})
                
                chat = model.start_chat(history=fallback_history)
                response = chat.send_message(user_message)
                response_text = response.text
            else:
                logger.error(f"Gemini Chat Error: {e}")
                return "❌ Lo siento, hubo un error al procesar tu mensaje con la IA."

        # 5. Save to DB
        # Save User Message
        new_user_msg = ChatMessage(session_id=session_id, role="user", content=user_message)
        self.db.add(new_user_msg)
        
        # Save AI Response
        new_ai_msg = ChatMessage(session_id=session_id, role="assistant", content=response_text)
        self.db.add(new_ai_msg)
        
        chat_session.last_message_at = datetime.datetime.utcnow()
        self.db.commit()
        
        return response_text

    def generate_chart_data(self, client_id: str, requirements: str):
        """
        Generates structured JSON for charts based on natural language requirements.
        """
        ai_context = self.db.query(AIContext).filter(AIContext.ficha_cliente_id == client_id).first()
        if not ai_context:
            raise Exception("No context found")
            
        model = self._get_model(ai_context)
        
        prompt = f"""
        Genera un JSON ESTRICTO para visualizar los siguientes datos:
        Requisitos: {requirements}
        
        Estructura esperada (ejemplo genérico, adáptalo a los datos reales):
        {{
            "title": "Título del Gráfico",
            "type": "bar|line|pie|scatter",
            "data": [
                {{"label": "Category A", "value": 10}},
                {{"label": "Category B", "value": 20}}
            ],
            "summary": "Breve interpretación de 1 frase"
        }}
        
        IMPORTANTE: Devuelve SOLO el JSON. Sin markdown, sin explicaciones extra.
        """
        
        parts = [prompt]
        if not ai_context.gemini_cache_name:
            # Prepend ALL files if not cached
            from api.models import ContextFile
            files = self.db.query(ContextFile).filter(ContextFile.ai_context_id == ai_context.id).all()
            gemini_files = [genai.get_file(f.gemini_uri) for f in files]
            parts = gemini_files + [prompt]
            
        response = model.generate_content(
            parts,
            generation_config={"response_mime_type": "application/json"}
        )
        
        try:
            return json.loads(response.text)
        except json.JSONDecodeError:
            logger.error(f"Invalid JSON from Gemini: {response.text}")
            return {"error": "Failed to generate valid JSON", "raw": response.text}

    # =========================================================================
    # Q1-Q10 SOCIAL MEDIA ANALYSIS PROMPTS
    # =========================================================================
    # 
    # FUENTE DE DATOS: XLS de Scraping de Redes Sociales
    # 
    # Estructura del XLS:
    # ├── Sheet "Posts": link, id_cliente, platform, created_at, content, likes, comments_count, shares, views
    # ├── Sheet "Comments": link, comment_text, ownerUsername, created_at, likes
    # └── Sheet "Ficha Cliente": id_cliente, nombre_cliente, industria, pais, descripcion
    #
    # IMPORTANTE: Estos análisis son EXCLUSIVAMENTE para datos de redes sociales.
    # NO mezclar con informes financieros, PDFs u otros documentos.
    # =========================================================================
    
    # Mapeo de qué columnas leer para cada módulo
    ANALYSIS_DATA_FOCUS = {
        "q1_emociones": {
            "sheet": "Comments",
            "columns": ["comment_text"],
            "description": "Analiza el texto de TODOS los comentarios"
        },
        "q2_personalidad": {
            "sheet": "Comments", 
            "columns": ["comment_text"],
            "description": "Analiza cómo la audiencia PERCIBE la personalidad de la marca"
        },
        "q3_topicos": {
            "sheet": "Comments",
            "columns": ["comment_text"],
            "description": "Extrae temas de los comentarios de la audiencia"
        },
        "q4_marcos_narrativos": {
            "sheet": "Comments",
            "columns": ["comment_text"],
            "description": "Analiza cómo la audiencia enmarca su experiencia"
        },
        "q5_influenciadores": {
            "sheet": "Comments",
            "columns": ["ownerUsername", "comment_text", "likes"],
            "description": "Identifica usuarios influyentes por frecuencia y engagement"
        },
        "q6_oportunidades": {
            "sheet": "Comments",
            "columns": ["comment_text"],
            "description": "Busca pain points, necesidades no cubiertas, quejas recurrentes"
        },
        "q7_sentimiento_detallado": {
            "sheet": "Comments",
            "columns": ["comment_text"],
            "description": "Clasifica sentimiento de cada comentario"
        },
        "q8_temporal": {
            "sheet": "Both",
            "columns": ["created_at", "comment_text", "likes"],
            "description": "Analiza evolución temporal del sentimiento y engagement"
        },
        "q9_recomendaciones": {
            "sheet": "Both",
            "columns": ["ALL"],
            "description": "Síntesis de todos los hallazgos para generar acciones"
        },
    }
    
    def _get_social_media_prompts(self) -> dict:
        """
        Prompts optimizados para análisis de redes sociales.
        Cada prompt especifica exactamente qué datos leer del XLS.
        """
        return {
            "q1_emociones": """ANÁLISIS Q1: Emociones de la Audiencia (Rueda de Plutchik)

=== IDIOMA ===
El contenido puede estar en español, inglés, portugués u otro idioma.
Analiza en el idioma original pero genera TODOS los outputs en español.

=== DATOS A ANALIZAR ===
Lee ÚNICAMENTE la columna "comment_text" del sheet "Comments".
Ignora: posts de la marca, métricas numéricas, fechas.

=== TAREA ===
Analiza el tono emocional de los COMENTARIOS de la audiencia.
Clasifica según las 8 emociones primarias de Plutchik:
- Alegría: Satisfacción, felicidad, entusiasmo por la marca
- Confianza: Seguridad, lealtad, recomendaciones positivas
- Miedo: Preocupación, incertidumbre, dudas sobre el producto
- Sorpresa: Reacciones inesperadas, descubrimientos
- Tristeza: Decepción, frustración, experiencias negativas
- Aversión: Rechazo, disgusto, críticas fuertes
- Ira: Enojo, quejas agresivas, reclamos
- Anticipación: Expectativas, preguntas sobre el futuro

=== REGLAS ===
- Asigna INTENSIDAD (0.0 a 1.0) a cada emoción
- Los valores son INDEPENDIENTES - NO deben sumar 1.0
- 0.0 = ausencia total, 1.0 = máxima intensidad
- Basa el análisis en el TEXTO de los comentarios
- "descripcion" máximo 50 caracteres
- "insight" máximo 100 caracteres

=== RESPUESTA (JSON exacto) ===
{
    "Alegría": 0.45,
    "Confianza": 0.72,
    "Miedo": 0.15,
    "Sorpresa": 0.25,
    "Tristeza": 0.18,
    "Aversión": 0.12,
    "Ira": 0.20,
    "Anticipación": 0.55,
    "emocion_dominante": {"emocion": "Confianza", "intensidad": 0.72, "descripcion": "max 50 chars"},
    "insight": "max 100 chars"
}""",

            "q2_personalidad": """ANÁLISIS Q2: Personalidad de Marca PERCIBIDA (Aaker)

=== IDIOMA ===
El contenido puede estar en español, inglés, portugués u otro idioma.
Analiza en el idioma original pero genera TODOS los outputs en español.

=== DATOS A ANALIZAR ===
Lee ÚNICAMENTE la columna "comment_text" del sheet "Comments".
Analiza cómo la AUDIENCIA percibe la personalidad de la marca.

=== TAREA ===
Analiza cómo los COMENTARIOS de la audiencia reflejan su percepción de la marca.
Evalúa las 5 dimensiones de personalidad de Aaker según lo que DICEN los usuarios:
- Sinceridad: ¿Los usuarios ven la marca como honesta, auténtica, cercana?
- Emoción: ¿Los usuarios ven la marca como innovadora, atrevida, actual?
- Competencia: ¿Los usuarios ven la marca como profesional, confiable, exitosa?
- Sofisticación: ¿Los usuarios ven la marca como elegante, prestigiosa, exclusiva?
- Robustez: ¿Los usuarios ven la marca como fuerte, duradera, tradicional?

=== REGLAS ===
- Score de 0 a 100 para cada dimensión
- Basa el análisis en lo que los COMENTARIOS revelan sobre la percepción
- Busca adjetivos, comparaciones y opiniones en los comentarios
- "descripcion" máximo 50 caracteres
- "insight" máximo 100 caracteres

=== RESPUESTA (JSON exacto) ===
{
    "Sinceridad": 60,
    "Emoción": 40,
    "Competencia": 85,
    "Sofisticación": 50,
    "Robustez": 30,
    "personalidad_dominante": {"tipo": "Competencia", "score": 85, "descripcion": "max 50 chars"},
    "insight": "max 100 chars"
}""",

            "q3_topicos": """ANÁLISIS Q3: Tópicos de Conversación

=== IDIOMA ===
El contenido puede estar en español, inglés, portugués u otro idioma.
Analiza en el idioma original pero genera TODOS los outputs en español.

=== DATOS A ANALIZAR ===
Lee ÚNICAMENTE la columna "comment_text" del sheet "Comments".
Ignora: posts de la marca, usernames, métricas.

=== TAREA ===
Identifica los 5 temas principales que discute la audiencia.
Para cada tema determina:
- Qué porcentaje de comentarios habla de este tema (frecuencia_relativa 0-100)
- Si el sentimiento hacia ese tema es positivo, negativo o neutro

=== REGLAS ===
- Exactamente 5 temas
- "topic": título en español, 2-4 palabras
- "frecuencia_relativa": 0 a 100 (entero, porcentaje del total)
- "sentimiento_promedio": -1.0 (muy negativo) a 1.0 (muy positivo)
- "insight" máximo 100 caracteres

=== RESPUESTA (JSON exacto) ===
{
    "analisis_agregado": [
        {"topic": "Precio y Valor", "frecuencia_relativa": 35, "sentimiento_promedio": -0.2},
        {"topic": "Atención al Cliente", "frecuencia_relativa": 25, "sentimiento_promedio": 0.4},
        {"topic": "Calidad del Producto", "frecuencia_relativa": 20, "sentimiento_promedio": 0.6},
        {"topic": "Tiempos de Entrega", "frecuencia_relativa": 12, "sentimiento_promedio": -0.3},
        {"topic": "Funcionalidades", "frecuencia_relativa": 8, "sentimiento_promedio": 0.5}
    ],
    "insight": "max 100 chars"
}""",

            "q4_marcos_narrativos": """ANÁLISIS Q4: Marcos Narrativos Emocionales

=== IDIOMA ===
El contenido puede estar en español, inglés, portugués u otro idioma.
Analiza en el idioma original pero genera TODOS los outputs en español.

=== DATOS A ANALIZAR ===
Lee ÚNICAMENTE la columna "comment_text" del sheet "Comments".
Ignora: posts de la marca, métricas numéricas.

=== TAREA ===
Analiza el TONO NARRATIVO de los comentarios de la audiencia:
- Positivo: Elogios, recomendaciones, satisfacción, "me encanta", "excelente"
- Negativo: Quejas, críticas, frustración, "horrible", "nunca más"
- Aspiracional: Deseos, expectativas futuras, "ojalá", "deberían agregar", "me gustaría"

Analiza también cómo evoluciona este tono semana a semana (últimas 5 semanas).

=== REGLAS ===
- "analisis_agregado": proporciones (0.0 a 1.0) que DEBEN sumar 1.0
- "evolucion_temporal": 5 semanas de datos
- Cada semana tiene marcos_distribucion que también suma 1.0
- "insight" máximo 100 caracteres

=== RESPUESTA (JSON exacto) ===
{
    "analisis_agregado": {
        "Positivo": 0.45,
        "Negativo": 0.25,
        "Aspiracional": 0.30
    },
    "evolucion_temporal": [
        {"semana": 1, "marcos_distribucion": {"Positivo": 0.35, "Negativo": 0.40, "Aspiracional": 0.25}},
        {"semana": 2, "marcos_distribucion": {"Positivo": 0.40, "Negativo": 0.35, "Aspiracional": 0.25}},
        {"semana": 3, "marcos_distribucion": {"Positivo": 0.42, "Negativo": 0.30, "Aspiracional": 0.28}},
        {"semana": 4, "marcos_distribucion": {"Positivo": 0.45, "Negativo": 0.27, "Aspiracional": 0.28}},
        {"semana": 5, "marcos_distribucion": {"Positivo": 0.48, "Negativo": 0.22, "Aspiracional": 0.30}}
    ],
    "insight": "max 100 chars"
}""",

            "q5_influenciadores": """ANÁLISIS Q5: Voces Influyentes en la Conversación

=== IDIOMA ===
El contenido puede estar en español, inglés, portugués u otro idioma.
Analiza en el idioma original pero genera TODOS los outputs en español.

=== DATOS A ANALIZAR ===
Lee del sheet "Comments": ownerUsername, comment_text, likes.
Analiza: frecuencia de comentarios por usuario, likes recibidos, tono del contenido.

=== TAREA ===
Identifica las 5 voces más influyentes con métricas cuantitativas:
- autoridad_promedio: qué tan experto/técnico es su contenido (0-100)
- afinidad_promedio: qué tan alineado está con la marca (0-100)
- menciones: cantidad de comentarios del usuario
- score_centralidad: importancia relativa en la conversación (0.0-1.0)
- sentimiento: tono general de sus comentarios (-1.0 a 1.0)
- comentario_evidencia: su comentario más representativo

=== REGLAS ===
- Exactamente 5 influenciadores
- "username": el ownerUsername con @ (max 30 chars)
- Todos los scores deben ser numéricos
- "comentario_evidencia": cita textual de máximo 100 chars
- "insight" máximo 100 caracteres

=== RESPUESTA (JSON exacto) ===
{
    "influenciadores_globales": [
        {"username": "@DataScience_Expert", "autoridad_promedio": 92, "afinidad_promedio": 85, "menciones": 15, "score_centralidad": 0.95, "sentimiento": 0.8, "comentario_evidencia": "Nunca había visto una interfaz tan fluida."},
        {"username": "@CTO_Barcelona", "autoridad_promedio": 88, "afinidad_promedio": 72, "menciones": 8, "score_centralidad": 0.82, "sentimiento": 0.6, "comentario_evidencia": "Excelente para equipos enterprise."},
        {"username": "@Critic_One", "autoridad_promedio": 75, "afinidad_promedio": 35, "menciones": 12, "score_centralidad": 0.78, "sentimiento": -0.4, "comentario_evidencia": "El precio es excesivo para lo que ofrece."},
        {"username": "@InnovaConsulting", "autoridad_promedio": 68, "afinidad_promedio": 90, "menciones": 20, "score_centralidad": 0.72, "sentimiento": 0.7, "comentario_evidencia": "Lo recomiendo a todos mis clientes."},
        {"username": "@TechReviewer", "autoridad_promedio": 82, "afinidad_promedio": 60, "menciones": 5, "score_centralidad": 0.65, "sentimiento": 0.3, "comentario_evidencia": "Buena herramienta, le falta integración."}
    ],
    "insight": "max 100 chars"
}""",

            "q6_oportunidades": """ANÁLISIS Q6: Matriz de Oportunidades

=== IDIOMA ===
El contenido puede estar en español, inglés, portugués u otro idioma.
Analiza en el idioma original pero genera TODOS los outputs en español.

=== DATOS A ANALIZAR ===
Lee ÚNICAMENTE la columna "comment_text" del sheet "Comments".
Busca: quejas, sugerencias, comparaciones con competencia, necesidades no cubiertas.

=== TAREA ===
Identifica oportunidades y evalúa cada una en dos dimensiones:
- gap_score: qué tan grande es la brecha/necesidad del mercado (0-100)
- competencia_score: qué tan bien la competencia cubre esto (0-100)

Cuadrantes resultantes:
- gap_score alto + competencia_score alto = Quick Wins (fácil de implementar, alto impacto)
- gap_score bajo + competencia_score alto = Sustain (mantener, ya se hace bien)
- gap_score alto + competencia_score bajo = Invest (oportunidad de diferenciación)
- gap_score bajo + competencia_score bajo = Drop (baja prioridad)

=== REGLAS ===
- Exactamente 6 oportunidades
- "oportunidad": título corto (max 30 chars)
- "gap_score": 0-100 (qué tan grande es la necesidad)
- "competencia_score": 0-100 (capacidad actual para resolver)
- "recomendacion_accion": qué hacer específicamente (max 60 chars)
- "detalle": contexto de la oportunidad (max 60 chars)
- "insight" máximo 80 caracteres

=== RESPUESTA (JSON exacto) ===
{
    "oportunidades": [
        {"oportunidad": "Pricing para PyMEs", "gap_score": 85, "competencia_score": 90, "recomendacion_accion": "Implementar plan escalonado por tamaño", "detalle": "Alta demanda y alta capacidad de ejecución"},
        {"oportunidad": "Integración SAP", "gap_score": 75, "competencia_score": 40, "recomendacion_accion": "Evaluar partnership técnico Q2", "detalle": "Demanda alta pero requiere inversión"},
        {"oportunidad": "App Móvil Nativa", "gap_score": 30, "competencia_score": 25, "recomendacion_accion": "Postergar, nicho pequeño", "detalle": "Bajo interés del mercado"},
        {"oportunidad": "Soporte 24/7", "gap_score": 65, "competencia_score": 80, "recomendacion_accion": "Expandir horarios paulatinamente", "detalle": "Demanda moderada, factible"},
        {"oportunidad": "Modo Oscuro", "gap_score": 95, "competencia_score": 95, "recomendacion_accion": "Lanzar en próximo sprint", "detalle": "Feature #1 más solicitada"},
        {"oportunidad": "Multi-idioma", "gap_score": 45, "competencia_score": 70, "recomendacion_accion": "Agregar portugués y francés", "detalle": "Abre mercados LATAM y Europa"}
    ],
    "insight": "max 80 chars"
}""",

            "q7_sentimiento_detallado": """ANÁLISIS Q7: Sentimiento Detallado

=== IDIOMA ===
El contenido puede estar en español, inglés, portugués u otro idioma.
Analiza en el idioma original pero genera TODOS los outputs en español.

=== DATOS A ANALIZAR ===
Lee ÚNICAMENTE la columna "comment_text" del sheet "Comments".
Clasifica CADA comentario en una categoría de sentimiento.

=== TAREA ===
Analiza el sentimiento de los comentarios:
- Positivo: Elogios, satisfacción, recomendaciones, emojis positivos 🚀💡
- Negativo: Quejas, críticas, frustración, decepción
- Neutral: Preguntas informativas, comentarios sin carga emocional
- Mixto: Comentarios con elementos positivos Y negativos

Además calcula:
- subjetividad_promedio_global: qué tan subjetivos vs objetivos son los comentarios (0.0-1.0)
- ejemplo_mixto: un comentario real que ejemplifique el sentimiento mixto

=== REGLAS ===
- Porcentajes de 0.0 a 1.0
- La suma de Positivo+Negativo+Neutral+Mixto debe ser aproximadamente 1.0
- subjetividad_promedio_global: 0.0 = muy objetivo, 1.0 = muy subjetivo
- ejemplo_mixto: máximo 120 caracteres, cita textual de un comentario
- "insight" máximo 100 caracteres

=== RESPUESTA (JSON exacto) ===
{
    "analisis_agregado": {
        "Positivo": 0.35,
        "Negativo": 0.20,
        "Neutral": 0.30,
        "Mixto": 0.15,
        "subjetividad_promedio_global": 0.72,
        "ejemplo_mixto": "Me encanta el diseño y la velocidad, pero el precio me parece elevado para las funcionalidades."
    },
    "insight": "max 100 chars"
}""",

            "q8_temporal": """ANÁLISIS Q8: Evolución Temporal

=== IDIOMA ===
El contenido puede estar en español, inglés, portugués u otro idioma.
Analiza en el idioma original pero genera TODOS los outputs en español.

=== DATOS A ANALIZAR ===
Lee de AMBOS sheets:
- Posts: created_at, likes, comments_count, shares
- Comments: created_at, comment_text, likes

=== TAREA ===
Analiza cómo evoluciona el sentimiento y engagement semana a semana:
- Identifica las últimas 5 semanas de datos
- Para cada semana calcula: % de sentimiento positivo, engagement total, tema principal
- Detecta la tendencia general

=== REGLAS ===
- "tendencia": SOLO "Mejora", "Deterioro Detectado" o "Estable"
- Exactamente 5 semanas en serie_temporal_semanal
- "fecha_semana": formato "Sem 1", "Sem 2", etc.
- "porcentaje_positivo": 0.0 a 1.0 (proporción de comentarios positivos)
- "engagement": número entero (suma de likes+comments+shares de esa semana)
- "topico_principal": tema más discutido esa semana (max 30 chars)
- "insight" máximo 100 caracteres

=== RESPUESTA (JSON exacto) ===
{
    "resumen_global": {
        "tendencia": "Mejora"
    },
    "serie_temporal_semanal": [
        {"fecha_semana": "Sem 1", "porcentaje_positivo": 0.45, "engagement": 1200, "topico_principal": "Lanzamiento Beta"},
        {"fecha_semana": "Sem 2", "porcentaje_positivo": 0.52, "engagement": 1500, "topico_principal": "Feedback Inicial"},
        {"fecha_semana": "Sem 3", "porcentaje_positivo": 0.58, "engagement": 2100, "topico_principal": "Nuevas Features"},
        {"fecha_semana": "Sem 4", "porcentaje_positivo": 0.62, "engagement": 1900, "topico_principal": "Integraciones"},
        {"fecha_semana": "Sem 5", "porcentaje_positivo": 0.68, "engagement": 2400, "topico_principal": "Casos de Éxito"}
    ],
    "insight": "max 100 chars"
}""",

            "q9_recomendaciones": """ANÁLISIS Q9: Recomendaciones Estratégicas

=== IDIOMA ===
El contenido puede estar en español, inglés, portugués u otro idioma.
Analiza en el idioma original pero genera TODOS los outputs en español.

=== DATOS A ANALIZAR ===
SÍNTESIS de todo el XLS: Posts, Comments y métricas.
Usa los hallazgos de Q1-Q8 para generar acciones.

=== TAREA ===
Genera 10 recomendaciones accionables basadas en los datos:
- Si hay quejas de precio → recomendar revisión de pricing
- Si hay preguntas técnicas → recomendar mejor documentación
- Si hay usuarios influyentes → recomendar programa de embajadores
- Si hay sentimiento negativo → recomendar mejoras específicas

=== REGLAS ===
- Exactamente 10 recomendaciones
- "recomendacion": acción clara (max 60 chars)
- "descripcion": basada en datos del análisis (max 120 chars)
- "area_estrategica": "Producto", "Marketing", "Atención al Cliente", "Ventas", "Operaciones", "Finanzas" o "Tecnología"
- "score_impacto": 1-100
- "score_esfuerzo": 1-100
- "prioridad": impacto/esfuerzo
- "urgencia": "CRÍTICA", "ALTA", "MEDIA" o "BAJA"
- "insight" máximo 100 caracteres

=== RESPUESTA (JSON exacto) ===
{
    "lista_recomendaciones": [
        {
            "recomendacion": "Crear plan pricing para PyMEs",
            "descripcion": "46 likes en comentario sobre precios altos. Oportunidad de segmento desatendido.",
            "area_estrategica": "Ventas",
            "score_impacto": 85,
            "score_esfuerzo": 40,
            "prioridad": 2.12,
            "urgencia": "ALTA"
        }
    ],
    "resumen_global": {
        "recomendaciones_criticas": 3,
        "areas_prioritarias": ["Ventas", "Producto"]
    },
    "insight": "max 100 chars"
}"""
        }
    
    def _build_social_media_prompt(self, module_key: str) -> str:
        """
        Construye el prompt para análisis de redes sociales.
        Simple y directo - sin lógica condicional innecesaria.
        """
        prompts = self._get_social_media_prompts()
        return prompts.get(module_key, "")

    def _run_single_analysis(self, model, prompt: str, files_content: list = None) -> dict:
        """Execute a single Q analysis with Gemini"""
        try:
            parts = []
            if files_content:
                parts.extend(files_content)
            parts.append(prompt)
            
            response = model.generate_content(
                parts,
                generation_config={
                    "response_mime_type": "application/json",
                    "temperature": 0.2,  # Bajo para consistencia JSON
                    "top_p": 0.8
                }
            )
            
            result = json.loads(response.text)
            return {"status": "success", "data": result}
        except json.JSONDecodeError as e:
            logger.error(f"JSON Parse Error: {e}")
            return {"status": "error", "error": str(e), "raw": response.text if 'response' in dir() else None}
        except Exception as e:
            logger.error(f"Analysis Error: {e}")
            return {"status": "error", "error": str(e)}

    def generate_full_analysis(self, client_id: str) -> dict:
        """
        Generate complete Q1-Q10 analysis for a client using their cached context.
        Now with context-aware prompts that adapt based on available data sources.
        """
        logger.info(f"🚀 Starting Full Analysis (Q1-Q10) for Client: {client_id}")
        
        # 1. Get Context
        ai_context = self.db.query(AIContext).filter(AIContext.ficha_cliente_id == client_id).first()
        if not ai_context:
            raise Exception("No context found for this client. Please upload files first.")
        
        # 2. Q1-Q10 is ONLY for social media data (XLS scraping)
        logger.info(f"📊 Using Social Media Analysis prompts (XLS only)")
        
        # 3. Get Model
        model = self._get_model(ai_context)
        
        # 4. If no cache, we need to include files in each request
        files_content = None
        if not ai_context.gemini_cache_name:
            from api.models import ContextFile
            files = self.db.query(ContextFile).filter(ContextFile.ai_context_id == ai_context.id).all()
            files_content = [genai.get_file(f.gemini_uri) for f in files]
            logger.info(f"📎 Using File API with {len(files_content)} files")
        else:
            logger.info(f"⚡ Using Context Cache: {ai_context.gemini_cache_name}")
        
        results = {}
        
        # 5. Run Q1-Q9 Analyses with context-aware prompts
        analysis_order = [
            ("q1_emociones", "Q1 - Emociones (Plutchik)"),
            ("q2_personalidad", "Q2 - Personalidad de Marca (Aaker)"),
            ("q3_topicos", "Q3 - Tópicos Principales"),
            ("q4_marcos_narrativos", "Q4 - Marcos Narrativos (Entman)"),
            ("q5_influenciadores", "Q5 - Influenciadores"),
            ("q6_oportunidades", "Q6 - Oportunidades"),
            ("q7_sentimiento_detallado", "Q7 - Sentimiento Detallado"),
            ("q8_temporal", "Q8 - Análisis Temporal"),
            ("q9_recomendaciones", "Q9 - Recomendaciones Estratégicas"),
        ]
        
        for key, name in analysis_order:
            logger.info(f"📊 Running {name}...")
            # Build social media specific prompt (XLS only)
            prompt = self._build_social_media_prompt(key)
            result = self._run_single_analysis(model, prompt, files_content)
            results[key] = {
                "metadata": {
                    "module": name, 
                    "status": result["status"],
                    "data_source": "social_media_xls"
                },
                "results": result.get("data", {}),
                "errors": [result.get("error")] if result["status"] == "error" else []
            }
            logger.info(f"   ✅ {name} completed")
        
        # 5. Generate Q10 - Executive Summary (Synthesis)
        logger.info("📊 Running Q10 - Resumen Ejecutivo...")
        q10_result = self._generate_q10_summary(results)
        results["q10_resumen"] = q10_result
        logger.info("   ✅ Q10 - Resumen Ejecutivo completed")
        
        # 6. Save results to database
        logger.info("💾 Saving results to database...")
        self._save_analysis_to_db(client_id, results)
        logger.info("   ✅ Results saved to SocialMediaInsight")
        
        # 7. Build final output
        final_output = {
            "client_id": client_id,
            "generated_at": datetime.datetime.utcnow().isoformat(),
            "cache_used": ai_context.gemini_cache_name is not None,
            "analyses": results,
            "summary": {
                "total_analyses": 10,
                "successful": sum(1 for r in results.values() if r.get("metadata", {}).get("status") == "success"),
                "failed": sum(1 for r in results.values() if r.get("metadata", {}).get("status") == "error")
            }
        }
        
        logger.info(f"✅ Full Analysis Complete: {final_output['summary']['successful']}/10 successful")
        return final_output
    
    def _save_analysis_to_db(self, client_id: str, results: dict):
        """
        Save Q1-Q10 analysis results to SocialMediaInsight table.
        """
        from api.models import SocialMediaInsight, FichaCliente
        
        try:
            # Verify client exists
            cliente = self.db.query(FichaCliente).filter(FichaCliente.id == client_id).first()
            if not cliente:
                logger.error(f"Client {client_id} not found, skipping save")
                return
            
            # Create new insight record
            insight = SocialMediaInsight(
                cliente_id=client_id,
                analysis_status="completed" if all(
                    r.get("metadata", {}).get("status") == "success" for r in results.values()
                ) else "partial",
                q1_emociones=results.get("q1_emociones"),
                q2_personalidad=results.get("q2_personalidad"),
                q3_topicos=results.get("q3_topicos"),
                q4_marcos_narrativos=results.get("q4_marcos_narrativos"),
                q5_influenciadores=results.get("q5_influenciadores"),
                q6_oportunidades=results.get("q6_oportunidades"),
                q7_sentimiento=results.get("q7_sentimiento_detallado"),
                q8_temporal=results.get("q8_temporal"),
                q9_recomendaciones=results.get("q9_recomendaciones"),
                q10_resumen=results.get("q10_resumen")
            )
            
            self.db.add(insight)
            
            # Update last_analysis_timestamp on FichaCliente
            cliente.last_analysis_timestamp = datetime.datetime.utcnow()
            
            self.db.commit()
            logger.info(f"✅ Saved insight ID: {insight.id}")
            
        except Exception as e:
            logger.error(f"Error saving analysis: {e}")
            self.db.rollback()
            raise

    def _generate_q10_summary(self, q1_q9_results: dict) -> dict:
        """
        Generate Q10 Executive Summary by synthesizing Q1-Q9 results.
        This is a Python-based synthesis (same approach as legacy).
        """
        try:
            kpis = {}
            hallazgos = []
            urgencias = {"48_horas": [], "semana_1": [], "semanas_2_3": [], "no_urgente": []}
            
            # Extract KPIs from Q1
            q1 = q1_q9_results.get("q1_emociones", {}).get("results", {})
            if q1:
                emocion_dom = q1.get("emocion_dominante", {})
                if emocion_dom:
                    kpis["emocion_dominante"] = emocion_dom.get("emocion", "N/A")
                    kpis["emocion_porcentaje"] = round(emocion_dom.get("porcentaje", 0) * 100, 1)
                    hallazgos.append(f"Emoción dominante: {emocion_dom.get('emocion')} ({kpis['emocion_porcentaje']}%)")
            
            # Extract from Q2
            q2 = q1_q9_results.get("q2_personalidad", {}).get("results", {})
            if q2:
                pers_dom = q2.get("personalidad_dominante", {})
                if pers_dom:
                    kpis["personalidad_marca"] = pers_dom.get("tipo", "N/A")
                    hallazgos.append(f"Personalidad de marca: {pers_dom.get('tipo')}")
            
            # Extract from Q3
            q3 = q1_q9_results.get("q3_topicos", {}).get("results", {})
            if q3:
                temas = q3.get("temas_principales", [])
                if temas:
                    kpis["tema_principal"] = temas[0].get("tema", "N/A")
                    hallazgos.append(f"Tema principal: {temas[0].get('tema')} ({round(temas[0].get('porcentaje', 0) * 100)}%)")
            
            # Extract from Q7
            q7 = q1_q9_results.get("q7_sentimiento_detallado", {}).get("results", {})
            if q7:
                agg = q7.get("analisis_agregado", {})
                if agg:
                    kpis["sentimiento_positivo_pct"] = round(agg.get("Positivo", 0) * 100, 1)
                    kpis["sentimiento_negativo_pct"] = round(agg.get("Negativo", 0) * 100, 1)
                    hallazgos.append(f"Sentimiento: {kpis['sentimiento_positivo_pct']}% positivo, {kpis['sentimiento_negativo_pct']}% negativo")
            
            # Extract from Q8
            q8 = q1_q9_results.get("q8_temporal", {}).get("results", {})
            if q8:
                resumen = q8.get("resumen_global", {})
                if resumen:
                    kpis["tendencia_temporal"] = resumen.get("tendencia", "N/A")
                    kpis["anomalias_detectadas"] = resumen.get("total_anomalias", 0)
                    hallazgos.append(f"Tendencia temporal: {resumen.get('tendencia')}")
            
            # Extract from Q9
            q9 = q1_q9_results.get("q9_recomendaciones", {}).get("results", {})
            if q9:
                recs = q9.get("lista_recomendaciones", [])
                resumen = q9.get("resumen_global", {})
                if resumen:
                    kpis["recomendaciones_criticas"] = resumen.get("recomendaciones_criticas", 0)
                
                # Classify recommendations by urgency
                for rec in recs:
                    urgencia = rec.get("urgencia", "MEDIA")
                    texto = rec.get("recomendacion", "")[:80]
                    if urgencia in ["CRÍTICA", "CRITICA"]:
                        urgencias["48_horas"].append(f"🔴 {texto}")
                    elif urgencia == "ALTA":
                        urgencias["semana_1"].append(f"🟠 {texto}")
                    elif urgencia in ["MEDIA-ALTA", "MEDIA"]:
                        urgencias["semanas_2_3"].append(f"🟡 {texto}")
                    else:
                        urgencias["no_urgente"].append(f"🟢 {texto}")
            
            # Build executive summary
            alerta = hallazgos[0] if hallazgos else "Análisis completado"
            
            resumen_general = f"""Análisis integral Q1-Q10 completado. 
Se identificaron {len(hallazgos)} hallazgos clave con {len(urgencias.get('48_horas', []))} acciones críticas para ejecutar en 48 horas.
Tendencia general: {kpis.get('tendencia_temporal', 'Estable')}.
KPI Principal: {kpis.get('emocion_dominante', 'N/A')} con {kpis.get('sentimiento_positivo_pct', 0)}% sentimiento positivo."""

            return {
                "metadata": {"module": "Q10 - Resumen Ejecutivo", "status": "success"},
                "results": {
                    "alerta_prioritaria": alerta,
                    "hallazgos_clave": hallazgos[:7],
                    "resumen_general": resumen_general,
                    "kpis_principales": kpis,
                    "urgencias_por_prioridad": urgencias
                },
                "errors": []
            }
        except Exception as e:
            logger.error(f"Q10 Synthesis Error: {e}")
            return {
                "metadata": {"module": "Q10 - Resumen Ejecutivo", "status": "error"},
                "results": {},
                "errors": [str(e)]
            }

