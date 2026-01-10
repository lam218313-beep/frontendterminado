
import logging
import json
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Any
from google import genai
from google.genai import types
from ..config import settings
from ..services.database import db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/brand", tags=["Brand Identity"])

# --- Models ---
class BrandColors(BaseModel):
    primary: str
    secondary: str
    accent: str
    background: str

class BrandTone(BaseModel):
    trait: str
    description: str

class BrandIdentity(BaseModel):
    mission: str
    vision: str
    values: List[dict] # {title: str, desc: str}
    tone_traits: List[BrandTone]
    archetype: str
    colors: Optional[dict] = {}
    typography: Optional[dict] = {}

class GenerateBrandRequest(BaseModel):
    client_id: str
    business_context: Optional[dict] = {} # Optional overrides

# --- Prompts ---
BRAND_PROMPT = """
Actúa como un Director Creativo de clase mundial y experto en Branding.
Tu tarea es definir la IDENTIDAD DE MARCA (Brand Book) para un negocio basándote en su contexto.

CONTEXTO DEL NEGOCIO:
{context}

Genera los siguientes elementos con lenguaje profesional, inspirador y estratégico:

1. **Misión**: Una frase poderosa que defina el propósito (max 20 palabras).
2. **Visión**: Una aspiración ambiciosa a futuro (max 20 palabras).
3. **Valores**: 3 valores centrales con una breve descripción de dos palabras (ej: "Innovación Ética: Avanzar sin romper").
4. **Arquetipo de Marca**: Uno de los 12 arquetipos de Carl Jung (ej: El Mago, El Cuidador, El Héroe, etc.)
5. **Tono de Voz**: 3 adjetivos que definan cómo habla la marca, con una breve explicación de una frase.
6. **Paleta de Colores Sugerida**: Sugiere códigos HEX para Primario (Brand Color), Secundario (Complementary), y Fondo (Background).

Responde ÚNICAMENTE con este JSON:
{{
    "mission": "Texto de la misión",
    "vision": "Texto de la visión",
    "values": [
        {{"title": "Valor 1", "desc": "Descripción corta"}},
        {{"title": "Valor 2", "desc": "Descripción corta"}},
        {{"title": "Valor 3", "desc": "Descripción corta"}}
    ],
    "archetype": "Nombre del Arquetipo",
    "tone_traits": [
        {{"trait": "Adjetivo 1", "desc": "Explicación breve"}},
        {{"trait": "Adjetivo 2", "desc": "Explicación breve"}},
        {{"trait": "Adjetivo 3", "desc": "Explicación breve"}}
    ],
    "colors": {{
        "primary": "#HEX",
        "secondary": "#HEX",
        "background": "#HEX"
    }}
}}
"""

# --- Endpoints ---

@router.get("/{client_id}")
async def get_brand(client_id: str):
    data = db.get_brand_identity(client_id)
    if not data:
        return {"status": "empty", "data": None}
    return {"status": "success", "data": data}

@router.post("/generate")
async def generate_brand(request: GenerateBrandRequest):
    client_id = request.client_id
    
    # 1. Fetch Context (Interview + Analysis if available)
    interview = db.get_interview(client_id)
    
    context_str = "Información no disponible."
    if interview and interview.get("data"):
        d = interview.get("data")
        context_str = f"""
        Nombre: {d.get('businessName')}
        Historia: {d.get('history')}
        Visión Original: {d.get('vision')}
        Producto: {d.get('product_context')}
        """
    
    # 2. Call Gemini
    try:
        if not settings.GEMINI_API_KEY:
             raise ValueError("GEMINI API KEY not set")

        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        response = await client.aio.models.generate_content(
            model="gemini-1.5-flash", 
            contents=BRAND_PROMPT.format(context=context_str),
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            )
        )
        
        # Clean & Parse
        result = json.loads(response.text)
        
        # 3. Save to DB
        db.update_brand_identity(client_id, result)
        
        return {"status": "generated", "data": result}
        
    except Exception as e:
        logger.error(f"Brand Gen Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
