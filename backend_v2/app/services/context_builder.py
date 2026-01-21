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
                 # Objectives (main)
                objectives = [n for n in strategy_nodes if n.get('type') == 'main']
                for idx, obj in enumerate(objectives):
                    context_blocks["analysis"].append({
                        "id": f"strat_obj_{idx}",
                        "label": f"Objetivo: {obj.get('label', 'Principal')}",
                        "text": obj.get('strategic_rationale') or obj.get('description', ''),
                        "selected": True
                    })
                
                # Pillars (secondary)
                pillars = [n for n in strategy_nodes if n.get('type') == 'secondary']
                for idx, pillar in enumerate(pillars):
                     context_blocks["analysis"].append({
                        "id": f"strat_pillar_{idx}",
                        "label": f"Pilar: {pillar.get('label', '')}",
                        "text": pillar.get('strategic_rationale') or pillar.get('description', ''),
                        "selected": True 
                    })
                
                # Concepts/Posts (post)
                concepts = [n for n in strategy_nodes if n.get('type') in ['concept', 'post']]
                # Limit to latest 3 concepts to avoid noise
                for idx, concept in enumerate(concepts[:3]):
                    context_blocks["analysis"].append({
                        "id": f"strat_concept_{idx}",
                        "label": f"Concepto: {concept.get('label', '')}",
                        "text": concept.get('description', ''),
                        "selected": False
                    })

            # 4. Fetch Analysis Report Data (Interpretations)
            latest_report = db.get_latest_completed_report(client_id)
            if latest_report and "audit_log" in latest_report:
                # Try to extract interpretations from audit_log or frontend_compatible_json
                # The interpretations are usually stored in 'interpretations' result or directly in the report text
                
                # We'll check 'frontend_compatible_json' first as it holds the structured Q1-Q10
                fcj = latest_report.get("frontend_compatible_json", {})
                
                # Check Q9 (Recomendaciones) specifically
                q9 = fcj.get("Q9", {}).get("results", {})
                if q9 and "lista_recomendaciones" in q9:
                     recs = q9["lista_recomendaciones"]
                     if isinstance(recs, list) and len(recs) > 0:
                         context_blocks["analysis"].append({
                            "id": "analysis_recs_q9",
                            "label": "Recomendaciones Estratégicas",
                            "text": "\n".join(f"• {r}" for r in recs[:5]),
                            "selected": True
                        })

                # Check for Q10 (Status)
                q10 = fcj.get("Q10", {}).get("results", {})
                if q10 and "alerta_prioritaria" in q10:
                     context_blocks["analysis"].append({
                        "id": "analysis_status_q10",
                        "label": "Estado Actual de Marca",
                        "text": q10["alerta_prioritaria"],
                        "selected": True
                    })

            logger.info(f"Context built: {len(context_blocks['interview'])} interview blocks, {len(context_blocks['analysis'])} analysis blocks")
            return context_blocks

        except Exception as e:
            logger.error(f"Error building context blocks: {str(e)}")
            return context_blocks

context_builder = ContextBuilderService()
