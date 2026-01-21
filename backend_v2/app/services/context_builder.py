import logging
from typing import List, Dict, Any, Optional
from ..services.database import db

logger = logging.getLogger(__name__)

class ContextBuilderService:
    """
    Service responsible for extracting and formatting client context (Interview, Brand Manual, Analysis)
    into digestible blocks for the Image Studio Wizard.
    """

    async def get_client_context_blocks(self, client_id: str) -> Dict[str, List[Dict[str, Any]]]:
        """
        Retrieves and formats context blocks for a specific client.
        
        Returns:
            Dict containing lists of blocks for 'interview', 'manual', and 'analysis'.
        """
        logger.info(f"Building context blocks for client {client_id}")
        
        context_blocks = {
            "interview": [],
            "manual": [],
            "analysis": []
        }

        try:
            # 1. Fetch Interview Data
            interview_data = db.get_interview(client_id)
            if interview_data and "data" in interview_data:
                data = interview_data["data"]
                
                # Extract specific fields as blocks
                if "businessName" in data:
                    context_blocks["interview"].append({
                        "id": "int_business_name",
                        "label": "Nombre del Negocio",
                        "text": data["businessName"],
                        "selected": True
                    })
                
                if "industry" in data:
                    context_blocks["interview"].append({
                        "id": "int_industry",
                        "label": "Industria",
                        "text": data["industry"],
                        "selected": True
                    })
                    
                if "targetAudience" in data:
                    context_blocks["interview"].append({
                        "id": "int_audience",
                        "label": "Público Objetivo",
                        "text": data["targetAudience"],
                        "selected": True
                    })
                
                if "brandVoice" in data:
                    context_blocks["interview"].append({
                        "id": "int_voice",
                        "label": "Voz de Marca",
                        "text": data["brandVoice"],
                        "selected": True
                    })
                    
                if "painPoints" in data:
                    context_blocks["interview"].append({
                        "id": "int_pain_points",
                        "label": "Puntos de Dolor",
                        "text": data["painPoints"],
                        "selected": True
                    })

            # 2. Fetch Brand Manual (Simulated/Placeholder for now as schema might vary)
            # In a real scenario, this would query a 'brands' table or similar
            # For now, we'll try to extract more deep branding info if available in interview or future tables
            # Assuming 'brands' table access via a method or direct query if needed. 
            # For this MVP, we stick to what we know exists in 'interview' which often acts as the brand base.
            
            # TODO: Add logic for 'brands' table when fully integrated
            
            # 3. Fetch Strategy/Analysis Data
            # This brings high-level strategy pillars
            strategy_nodes = db.get_strategy_nodes(client_id)
            if strategy_nodes:
                 # Filter for high-level objectives or pillars (usually type 'main' or 'secondary')
                objectives = [n for n in strategy_nodes if n.get('type') == 'main']
                for idx, obj in enumerate(objectives):
                    context_blocks["analysis"].append({
                        "id": f"strat_obj_{idx}",
                        "label": f"Objetivo Estratégico {idx + 1}",
                        "text": obj.get('label', ''),
                        "selected": True
                    })
                
                pillars = [n for n in strategy_nodes if n.get('type') == 'secondary']
                for idx, pillar in enumerate(pillars):
                     context_blocks["analysis"].append({
                        "id": f"strat_pillar_{idx}",
                        "label": f"Pilar de Contenido: {pillar.get('label', '')}",
                        "text": pillar.get('strategic_rationale', pillar.get('label', '')),
                        "selected": False # Default to false to not clutter unless needed
                    })

            logger.info(f"Context built: {len(context_blocks['interview'])} interview blocks, {len(context_blocks['analysis'])} analysis blocks")
            return context_blocks

        except Exception as e:
            logger.error(f"Error building context blocks: {str(e)}")
            return context_blocks

context_builder = ContextBuilderService()
