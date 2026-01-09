
import logging
import json
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import google.generativeai as genai
from ..config import settings
from ..services.database import db

router = APIRouter(prefix="/clients", tags=["Personas"])
logger = logging.getLogger(__name__)

# Configure Gemini
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class PersonaRequest(BaseModel):
    audience_data: dict
    market_data: dict = {}
    brand_data: dict = {}
    business_context: dict = {}  # Contains businessName, history, vision, differentiator

@router.post("/{client_id}/personas")
async def generate_personas(client_id: str, request: PersonaRequest):
    """
    Generates Anti-Persona and Ideal Persona based on Interview Data.
    Uses the SAME fields as the regular customer profile.
    """
    try:
        logger.info(f"Generating personas for client {client_id}")
        
        # Try to get additional context from stored interview
        interview_context = ""
        try:
            interview_data = db.get_interview(client_id)
            if interview_data and interview_data.get("data"):
                stored = interview_data["data"]
                interview_context = f"""
                Nombre del Negocio: {stored.get('businessName', 'N/A')}
                Historia: {stored.get('history', 'N/A')}
                Visión: {stored.get('vision', 'N/A')}
                Diferenciadores: {stored.get('differentiator', [])}
                Catálogo de Productos: {stored.get('product_context', 'No disponible')[:3000]}
                """
        except Exception as e:
            logger.warning(f"Could not fetch interview context: {e}")
        
        prompt = f"""
        Eres un estratega de marketing experto. Tu tarea es generar DOS perfiles de cliente basándote en:
        
        1. El CONTEXTO DEL NEGOCIO:
        {interview_context if interview_context else "No disponible"}
        
        Información adicional del negocio:
        {request.business_context}
        
        2. El CLIENTE HABITUAL (el que ya les compra frecuentemente):
        {json.dumps(request.audience_data, indent=2, ensure_ascii=False)}
        
        3. Información del MERCADO:
        {json.dumps(request.market_data, indent=2, ensure_ascii=False)}
        
        4. Información de MARCA:
        {json.dumps(request.brand_data, indent=2, ensure_ascii=False)}
        
        ---
        
        GENERA DOS PERFILES usando EXACTAMENTE estas categorías (las mismas del cliente habitual):
        
        **ANTI-PERSONA** (Cliente NO deseado - el que deberían evitar):
        Basándote en el negocio y el cliente habitual, identifica qué tipo de cliente sería PROBLEMÁTICO.
        Dale un nombre ficticio creativo en español.
        
        **CLIENTE IDEAL** (El cliente perfecto - al que deberían apuntar):
        Basándote en el negocio y el cliente habitual, identifica al cliente ÓPTIMO que maximizaría el valor.
        Dale un nombre ficticio creativo en español.
        
        RESPONDE ÚNICAMENTE con este JSON (sin markdown):
        {{
            "anti_persona": {{
                "name": "Nombre Creativo del Anti-Cliente",
                "ageRange": "18-24|25-34|35-44|45-54|55+",
                "gender": "Masculino|Femenino|Mixto/Todos",
                "location": "Descripción de ubicación",
                "occupation": "Ocupación/Rol",
                "maritalStatus": "Soltero|Casado|Con hijos|Sin hijos",
                "interests": "Intereses separados por coma",
                "values": "Valores principales",
                "painPoints": "Problema principal que tiene",
                "desires": "Lo que busca (de forma negativa para el negocio)",
                "lifestyle": "Estilo de vida",
                "incomeLevel": "Bajo|Medio|Medio-Alto|Alto|Premium",
                "priceSensitivity": "Busca Ofertas|Equilibrado|Paga por Valor|Sin restricciones",
                "spendingHabits": "Hábitos de gasto",
                "frequency": "Diaria|Semanal|Mensual|Anual|Esporádica",
                "loyalty": "Nuevo|Recurrente|Embajador de Marca",
                "decisionRole": "Usuario|Influenciador|Decisor Final",
                "usage": "Uso del producto",
                "avoid_reason": "Por qué evitar este tipo de cliente"
            }},
            "ideal_persona": {{
                "name": "Nombre Creativo del Cliente Ideal",
                "ageRange": "18-24|25-34|35-44|45-54|55+",
                "gender": "Masculino|Femenino|Mixto/Todos",
                "location": "Descripción de ubicación",
                "occupation": "Ocupación/Rol",
                "maritalStatus": "Soltero|Casado|Con hijos|Sin hijos",
                "interests": "Intereses separados por coma",
                "values": "Valores principales",
                "painPoints": "Problema principal que resuelves",
                "desires": "Lo que busca (alineado con el negocio)",
                "lifestyle": "Estilo de vida",
                "incomeLevel": "Bajo|Medio|Medio-Alto|Alto|Premium",
                "priceSensitivity": "Busca Ofertas|Equilibrado|Paga por Valor|Sin restricciones",
                "spendingHabits": "Hábitos de gasto",
                "frequency": "Diaria|Semanal|Mensual|Anual|Esporádica",
                "loyalty": "Nuevo|Recurrente|Embajador de Marca",
                "decisionRole": "Usuario|Influenciador|Decisor Final",
                "usage": "Uso del producto",
                "ideal_reason": "Por qué este es el cliente ideal"
            }}
        }}
        """
        
        model = genai.GenerativeModel("gemini-2.0-flash")
        response = model.generate_content(prompt)
        
        # Extract text from response
        response_text = response.text
        
        # Clean markdown if present
        cleaned_response = response_text.replace("```json", "").replace("```", "").strip()
        
        result = json.loads(cleaned_response)
        logger.info(f"Successfully generated personas for client {client_id}")
        return result

    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing error: {e}. Response was: {response_text[:500]}")
        raise HTTPException(status_code=500, detail=f"Error parsing AI response: {e}")
    except Exception as e:
        logger.error(f"Error generating personas: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


