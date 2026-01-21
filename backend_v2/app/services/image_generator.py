"""
Image Generation Service
========================
Handles AI image generation using Google Imagen 3 with context inheritance.
"""

import os
import logging
import uuid
import json
from typing import Dict, Any, Optional, List
from datetime import datetime
import google.generativeai as genai
from io import BytesIO
import base64

from .database import db

logger = logging.getLogger(__name__)

# Configure Google AI
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
else:
    logger.warning("⚠️ GOOGLE_API_KEY not found in environment variables")


# Prompt Template
IMAGE_GENERATION_PROMPT_TEMPLATE = """
Generate a high-quality {style_preset} image for social media content.

BRAND CONTEXT:
- Business: {business_name}
- Industry: {industry}
- Target Audience: {target_audience}
- Brand Voice: {brand_voice}

STRATEGIC CONTEXT:
- Objective: {objective_context}
- Strategy: {strategy_context}
- Concept: {concept_label}
- Strategic Purpose: {strategic_rationale}

CONTENT DETAILS:
- Format: {content_format} (post/reel/story)
- Hook: {selected_hook}
- Key Elements to Show: {key_elements_list}
- Narrative Structure: {narrative_structure}

VISUAL REQUIREMENTS:
- Description: {visual_description}
- Mood/Tone: {mood_tone}
- Color Palette: {color_suggestions}

USER ADDITIONS:
{user_custom_input}

TECHNICAL SPECS:
- Aspect Ratio: {aspect_ratio}
- Style: {style_preset}

Create a visually compelling image that embodies this strategy and resonates with the target audience.
"""


class ImageGenerationService:
    """Service for generating images with Google Imagen 3"""
    
    def __init__(self):
        self.model_name = "imagen-3.0-generate-001"
        self.cost_per_image = 0.03  # USD
    
    async def generate_image(
        self,
        client_id: str,
        task_id: Optional[str] = None,
        concept_id: Optional[str] = None,
        user_additions: str = "",
        style_preset: str = "realistic",
        aspect_ratio: str = "1:1",
        mood_tone: str = "",
        color_suggestions: str = "",
        negative_prompt: str = "text, watermark, blurry, low quality, distorted"
    ) -> Dict[str, Any]:
        """
        Generate an image using Google Imagen 3 with full context inheritance.
        
        Args:
            client_id: Client identifier
            task_id: Optional task ID for context
            concept_id: Optional concept ID for strategy context
            user_additions: Additional user-provided details
            style_preset: Visual style (realistic, illustration, 3d_render, minimalist, vintage)
            aspect_ratio: Image proportion (1:1, 16:9, 9:16, 4:3)
            mood_tone: Desired atmosphere
            color_suggestions: Color palette guidance
            negative_prompt: Elements to avoid
            
        Returns:
            Dictionary with generated image data
        """
        try:
            logger.info(f"🎨 Starting image generation for client {client_id}")
            
            # 1. Build context from inherited data
            context = await self._build_context(client_id, task_id, concept_id)
            
            # 2. Build final prompt
            base_prompt = self._build_base_prompt(context, user_additions, style_preset, aspect_ratio, mood_tone, color_suggestions)
            
            # 3. Generate image with Google Imagen 3
            start_time = datetime.now()
            image_data = await self._call_imagen_api(
                prompt=base_prompt,
                negative_prompt=negative_prompt,
                aspect_ratio=aspect_ratio
            )
            generation_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # 4. Save to Supabase Storage
            storage_path = f"generated_images/{client_id}/{uuid.uuid4()}.png"
            image_url = await self._save_to_storage(image_data, storage_path)
            
            # 5. Save metadata to database
            image_record = await self._save_to_database(
                client_id=client_id,
                task_id=task_id,
                concept_id=concept_id,
                base_prompt=context.get("base_prompt_summary", ""),
                user_additions=user_additions,
                final_prompt=base_prompt,
                image_url=image_url,
                storage_path=storage_path,
                style_preset=style_preset,
                aspect_ratio=aspect_ratio,
                mood_tone=mood_tone,
                negative_prompt=negative_prompt,
                generation_time_ms=generation_time_ms,
                objective_context=context.get("objective_context", ""),
                strategy_context=context.get("strategy_context", "")
            )
            
            logger.info(f"✅ Image generated successfully: {image_record['id']}")
            
            return {
                "status": "success",
                "image": image_record
            }
            
        except Exception as e:
            logger.error(f"❌ Image generation failed: {e}")
            raise Exception(f"Image generation error: {str(e)}")
    
    async def _build_context(
        self,
        client_id: str,
        task_id: Optional[str],
        concept_id: Optional[str]
    ) -> Dict[str, Any]:
        """
        Build context from interview, strategy, and task data.
        """
        context = {
            "business_name": "La Marca",
            "industry": "General",
            "target_audience": "Audiencia General",
            "brand_voice": "Profesional",
            "objective_context": "",
            "strategy_context": "",
            "concept_label": "",
            "strategic_rationale": "",
            "content_format": "post",
            "selected_hook": "",
            "key_elements_list": "",
            "narrative_structure": "",
            "visual_description": "",
            "base_prompt_summary": ""
        }
        
        # Get interview data
        try:
            interview = db.get_interview(client_id)
            if interview and interview.get("data"):
                data = interview["data"]
                context["business_name"] = data.get("businessName", context["business_name"])
                context["industry"] = data.get("industry", context["industry"])
                context["target_audience"] = data.get("targetAudience", context["target_audience"])
                context["brand_voice"] = data.get("brandVoice", context["brand_voice"])
        except Exception as e:
            logger.warning(f"Could not fetch interview data: {e}")
        
        # Get task data
        if task_id:
            try:
                task = db.get_task(task_id)
                if task:
                    context["content_format"] = task.get("format", "post")
                    context["selected_hook"] = task.get("selected_hook", "")
                    context["key_elements_list"] = ", ".join(task.get("key_elements", []))
                    context["narrative_structure"] = task.get("narrative_structure", "")
                    context["visual_description"] = task.get("description", "")
                    # Override concept_id if task has one
                    concept_id = task.get("concept_id") or concept_id
            except Exception as e:
                logger.warning(f"Could not fetch task data: {e}")
        
        # Get strategy/concept data
        if concept_id:
            try:
                nodes = db.get_strategy_nodes(client_id)
                concept = next((n for n in nodes if n["id"] == concept_id), None)
                
                if concept:
                    context["concept_label"] = concept.get("label", "")
                    context["strategic_rationale"] = concept.get("strategic_rationale", "")
                    
                    # Find parent strategy
                    parent_id = concept.get("parentId")
                    strategy = next((n for n in nodes if n["id"] == parent_id), None)
                    if strategy:
                        context["strategy_context"] = strategy.get("label", "")
                        
                        # Find grandparent objective
                        grandparent_id = strategy.get("parentId")
                        objective = next((n for n in nodes if n["id"] == grandparent_id), None)
                        if objective:
                            context["objective_context"] = objective.get("label", "")
            except Exception as e:
                logger.warning(f"Could not fetch strategy data: {e}")
        
        # Create summary for database
        context["base_prompt_summary"] = f"Brand: {context['business_name']}, Concept: {context['concept_label']}, Format: {context['content_format']}"
        
        return context
    
    def _build_base_prompt(
        self,
        context: Dict[str, Any],
        user_additions: str,
        style_preset: str,
        aspect_ratio: str,
        mood_tone: str,
        color_suggestions: str
    ) -> str:
        """
        Build the final prompt from context and user inputs.
        """
        # Fill in template
        prompt = IMAGE_GENERATION_PROMPT_TEMPLATE.format(
            style_preset=style_preset,
            business_name=context.get("business_name", ""),
            industry=context.get("industry", ""),
            target_audience=context.get("target_audience", ""),
            brand_voice=context.get("brand_voice", ""),
            objective_context=context.get("objective_context", ""),
            strategy_context=context.get("strategy_context", ""),
            concept_label=context.get("concept_label", ""),
            strategic_rationale=context.get("strategic_rationale", ""),
            content_format=context.get("content_format", ""),
            selected_hook=context.get("selected_hook", ""),
            key_elements_list=context.get("key_elements_list", ""),
            narrative_structure=context.get("narrative_structure", ""),
            visual_description=context.get("visual_description", ""),
            mood_tone=mood_tone or "professional and engaging",
            color_suggestions=color_suggestions or "brand-appropriate colors",
            user_custom_input=user_additions or "No additional requirements",
            aspect_ratio=aspect_ratio
        )
        
        return prompt.strip()
    
    async def _call_imagen_api(
        self,
        prompt: str,
        negative_prompt: str,
        aspect_ratio: str
    ) -> bytes:
        """
        Call Google Imagen 3 API to generate image.
        
        Note: As of Jan 2026, Google Imagen 3 is available through Vertex AI.
        This is a placeholder implementation. You'll need to use the actual
        Vertex AI Python SDK or REST API.
        """
        try:
            # TODO: Replace with actual Vertex AI Imagen 3 call
            # For now, this is a placeholder that would need the proper SDK
            
            # Example using Vertex AI (requires vertex-ai package):
            # from vertexai.preview.vision_models import ImageGenerationModel
            # model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-001")
            # response = model.generate_images(
            #     prompt=prompt,
            #     negative_prompt=negative_prompt,
            #     aspect_ratio=aspect_ratio,
            #     number_of_images=1
            # )
            # return response.images[0]._image_bytes
            
            logger.warning("⚠️ Imagen 3 API call is a placeholder. Implement actual Vertex AI integration.")
            
            # For development: return a placeholder
            # In production, this should call the actual API
            raise NotImplementedError(
                "Google Imagen 3 API integration pending. "
                "Please configure Vertex AI credentials and implement the actual API call."
            )
            
        except Exception as e:
            logger.error(f"Imagen API call failed: {e}")
            raise
    
    async def _save_to_storage(self, image_data: bytes, storage_path: str) -> str:
        """
        Save generated image to Supabase Storage.
        """
        try:
            # Upload to Supabase Storage
            response = db.client.storage.from_("generated-images").upload(
                path=storage_path,
                file=image_data,
                file_options={"content-type": "image/png"}
            )
            
            # Get public URL
            public_url = db.client.storage.from_("generated-images").get_public_url(storage_path)
            
            logger.info(f"✅ Image saved to storage: {storage_path}")
            return public_url
            
        except Exception as e:
            logger.error(f"Storage upload failed: {e}")
            raise
    
    async def _save_to_database(
        self,
        client_id: str,
        task_id: Optional[str],
        concept_id: Optional[str],
        base_prompt: str,
        user_additions: str,
        final_prompt: str,
        image_url: str,
        storage_path: str,
        style_preset: str,
        aspect_ratio: str,
        mood_tone: str,
        negative_prompt: str,
        generation_time_ms: int,
        objective_context: str,
        strategy_context: str
    ) -> Dict[str, Any]:
        """
        Save image metadata to database.
        """
        try:
            record = {
                "id": str(uuid.uuid4()),
                "client_id": client_id,
                "task_id": task_id,
                "concept_id": concept_id,
                "base_prompt": base_prompt,
                "user_additions": user_additions,
                "final_prompt": final_prompt,
                "image_url": image_url,
                "storage_path": storage_path,
                "style_preset": style_preset,
                "aspect_ratio": aspect_ratio,
                "negative_prompt": negative_prompt,
                "generation_model": self.model_name,
                "cost_usd": self.cost_per_image,
                "generation_time_ms": generation_time_ms,
                "is_selected": False,
                "objective_context": objective_context,
                "strategy_context": strategy_context,
                "created_at": datetime.utcnow().isoformat()
            }
            
            response = db.client.table("generated_images").insert(record).execute()
            
            logger.info(f"✅ Image metadata saved to database: {record['id']}")
            return response.data[0] if response.data else record
            
        except Exception as e:
            logger.error(f"Database save failed: {e}")
            raise
    
    async def get_images_for_task(self, task_id: str) -> List[Dict[str, Any]]:
        """Get all generated images for a specific task."""
        try:
            response = db.client.table("generated_images")\
                .select("*")\
                .eq("task_id", task_id)\
                .order("created_at", desc=True)\
                .execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Failed to fetch images for task {task_id}: {e}")
            return []
    
    async def get_images_for_client(
        self,
        client_id: str,
        limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Get recent generated images for a client (for gallery)."""
        try:
            response = db.client.table("generated_images")\
                .select("*")\
                .eq("client_id", client_id)\
                .order("created_at", desc=True)\
                .limit(limit)\
                .execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Failed to fetch images for client {client_id}: {e}")
            return []
    
    async def select_image_for_task(self, image_id: str, task_id: str) -> bool:
        """Mark an image as selected for a task."""
        try:
            # Unselect any previously selected images for this task
            db.client.table("generated_images")\
                .update({"is_selected": False})\
                .eq("task_id", task_id)\
                .execute()
            
            # Select the new image
            db.client.table("generated_images")\
                .update({"is_selected": True})\
                .eq("id", image_id)\
                .execute()
            
            # Update task with selected_image_id
            db.client.table("tasks")\
                .update({"selected_image_id": image_id})\
                .eq("id", task_id)\
                .execute()
            
            logger.info(f"✅ Image {image_id} selected for task {task_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to select image: {e}")
            return False


# Singleton instance
image_service = ImageGenerationService()
