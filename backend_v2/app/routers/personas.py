
import logging
from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
from ..services.gemini_service import gemini

router = APIRouter(prefix="/clients", tags=["Personas"])
logger = logging.getLogger(__name__)

class PersonaRequest(BaseModel):
    audience_data: dict
    market_data: dict = {}
    brand_data: dict = {}

@router.post("/{client_id}/personas")
async def generate_personas(client_id: str, request: PersonaRequest):
    """
    Generates Anti-Persona and Ideal Persona based on Interview Data.
    """
    try:
        logger.info(f"Generating personas for client {client_id}")
        
        prompt = f"""
        Act as an Expert Marketing Strategist. 
        Based on the provided Audience and Business data, generate two detailed profiles:
        
        1. **ANTI-PERSONA**: The type of client this business should AVOID.
           - Describe their red flags, behaviors, and why they are bad for business.
           - Give them a fictional name (e.g., "Cheap Charlie").
        
        2. **IDEAL BUYER PERSONA**: The perfect client.
           - Describe their demographics, psychographics, values, and buying behavior.
           - Give them a fictional name (e.g., "Premium Paula").
        
        **INPUT DATA**:
        Audience: {request.audience_data}
        Market: {request.market_data}
        Brand: {request.brand_data}
        
        **OUTPUT FORMAT JSON**:
        {{
            "anti_persona": {{
                "name": "...",
                "description": "...",
                "traits": ["...", "..."],
                "avoid_reason": "..."
            }},
            "ideal_persona": {{
                "name": "...",
                "description": "...",
                "traits": ["...", "..."],
                "trigger_reason": "..."
            }}
        }}
        """
        
        response = await gemini.generate_content(prompt)
        
        # Simple cleaning of response if it contains markdown (```json ...)
        cleaned_response = response.replace("```json", "").replace("```", "").strip()
        
        import json
        return json.loads(cleaned_response)

    except Exception as e:
        logger.error(f"Error generating personas: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
