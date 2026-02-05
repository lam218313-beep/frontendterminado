"""
NanoBanana Image Generation Service
====================================
Handles AI image generation using Google Gemini's native image generation.
Supports both Nano Banana (2.5 Flash) and Nano Banana Pro (3 Pro Image Preview).

Key Features:
- Multi-reference image support (up to 14 images)
- High-fidelity detail preservation for products
- Style transfer from reference images
- Template-based prompt construction
- Multi-turn conversation for iterative editing
"""

import logging
import uuid
import base64
import httpx
import os
import json
import tempfile
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime
import vertexai
from vertexai.preview.vision_models import ImageGenerationModel
from PIL import Image
import io

from .database import db
from ..config import settings

logger = logging.getLogger(__name__)


def _setup_google_credentials():
    """
    Setup Google credentials from environment variable for Railway/cloud deployment.
    Supports both file path (GOOGLE_APPLICATION_CREDENTIALS) and JSON string (GOOGLE_APPLICATION_CREDENTIALS_JSON).
    """
    # Check if credentials JSON is provided as environment variable
    creds_json = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS_JSON")
    if creds_json:
        try:
            # Write credentials to a temp file
            creds_dict = json.loads(creds_json)
            temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False)
            json.dump(creds_dict, temp_file)
            temp_file.close()
            os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = temp_file.name
            logger.info(f"✅ Google credentials loaded from GOOGLE_APPLICATION_CREDENTIALS_JSON")
            return True
        except Exception as e:
            logger.error(f"❌ Failed to parse GOOGLE_APPLICATION_CREDENTIALS_JSON: {e}")
            return False
    
    # Check if file path is already set
    creds_file = os.environ.get("GOOGLE_APPLICATION_CREDENTIALS")
    if creds_file and os.path.exists(creds_file):
        logger.info(f"✅ Google credentials file found: {creds_file}")
        return True
    
    logger.warning("⚠️ No Google Cloud credentials configured")
    return False


# Setup credentials on module load
_setup_google_credentials()


class NanoBananaService:
    """Service for generating images using Google Vertex AI (Imagen 3)"""
    
    # Model configurations for Vertex AI
    MODELS = {
        'flash': {
            'id': 'imagen-3.0-fast-generate-001',
            'name': 'Imagen 3 Fast',
            'description': 'Fast generation for high volume',
            'cost_per_image': 0.02, # Estimated
        },
        'pro': {
            'id': 'imagen-3.0-generate-001',
            'name': 'Imagen 3',
            'description': 'High fidelity professional quality',
            'cost_per_image': 0.04, # Estimated
        }
    }
    
    # Aspect ratio mappings
    ASPECT_RATIOS = {
        'post': '1:1',       # Instagram post
        'story': '9:16',     # Instagram story/reel
        'reel': '9:16',      # Instagram reel
        'cover': '16:9',     # Facebook cover
        'portrait': '4:5',   # Portrait post
        'landscape': '3:2',  # Landscape
    }
    
    def __init__(self):
        self._configure_client()
    
    def _configure_client(self):
        """Configure Vertex AI client"""
        try:
            # Initialize Vertex AI - credentials are loaded from GOOGLE_APPLICATION_CREDENTIALS
            vertexai.init(location="us-central1")
            logger.info("✅ Vertex AI client configured for NanoBanana (Imagen 3)")
        except Exception as e:
            logger.error(f"⚠️ Failed to configure Vertex AI: {e}")
    
    async def generate_for_task(
        self,
        task_id: str,
        template_id: Optional[str] = None,
        reference_image_ids: List[str] = [],
        product_image_id: Optional[str] = None,
        custom_prompt: str = "",
        aspect_ratio: Optional[str] = None,
        resolution: str = "2K",
        use_pro_model: bool = False,
    ) -> Dict[str, Any]:
        """
        Generate an image for a specific task from planning.
        
        Args:
            task_id: Required - ID of the task from planning
            template_id: Optional template for prompt structure
            reference_image_ids: IDs from brand_image_bank for style reference
            product_image_id: ID of product image for high-fidelity preservation
            custom_prompt: Additional user instructions
            aspect_ratio: Override aspect ratio (defaults to task format)
            resolution: 1K, 2K, or 4K
            use_pro_model: Use Gemini 3 Pro for higher quality
        
        Returns:
            Dict with generated image data and metadata
        """
        try:
            logger.info(f"🎨 Starting NanoBanana generation for task {task_id}")
            
            # 1. Fetch task data (REQUIRED)
            task = db.get_task(task_id)
            if not task:
                raise ValueError(f"Task {task_id} not found - generation requires a valid task")
            
            client_id = task.get('client_id')
            if not client_id:
                raise ValueError("Task has no client_id")
            
            # 2. Fetch brand visual DNA
            brand_dna = await self._get_brand_dna(client_id)
            
            # 3. Fetch reference images
            reference_images = await self._load_reference_images(reference_image_ids)
            product_image = await self._load_product_image(product_image_id) if product_image_id else None
            
            # 4. Build the prompt
            final_prompt = await self._build_prompt(
                task=task,
                brand_dna=brand_dna,
                template_id=template_id,
                custom_prompt=custom_prompt
            )
            
            # 5. Determine aspect ratio
            if not aspect_ratio:
                task_format = task.get('format', 'post')
                aspect_ratio = self.ASPECT_RATIOS.get(task_format, '1:1')
            
            # 6. Call NanoBanana API
            model_key = 'pro' if use_pro_model else 'flash'
            start_time = datetime.now()
            
            image_data, thinking_images, revised_prompt = await self._call_nanobanana_api(
                prompt=final_prompt,
                reference_images=reference_images,
                product_image=product_image,
                aspect_ratio=aspect_ratio,
                resolution=resolution,
                model_key=model_key
            )
            
            generation_time_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            
            # 7. Save to storage
            image_id = str(uuid.uuid4())
            storage_path = f"generated_images/{client_id}/{task_id}/{image_id}.png"
            image_url = await self._save_to_storage(image_data, storage_path)
            
            # 8. Save to database
            image_record = await self._save_to_database(
                image_id=image_id,
                client_id=client_id,
                task_id=task_id,
                template_id=template_id,
                base_prompt=final_prompt[:500],
                final_prompt=final_prompt,
                revised_prompt=revised_prompt,
                image_url=image_url,
                storage_path=storage_path,
                aspect_ratio=aspect_ratio,
                resolution=resolution,
                model_used=self.MODELS[model_key]['id'],
                reference_image_ids=reference_image_ids,
                product_image_id=product_image_id,
                thinking_images=thinking_images,
                generation_time_ms=generation_time_ms,
                brand_dna=brand_dna
            )
            
            logger.info(f"✅ Image generated successfully: {image_id}")
            
            return {
                "status": "success",
                "image": image_record,
                "thinking_images": thinking_images if thinking_images else []
            }
            
        except Exception as e:
            logger.error(f"❌ NanoBanana generation failed: {e}")
            raise Exception(f"Image generation error: {str(e)}")
    
    async def _get_brand_dna(self, client_id: str) -> Dict[str, Any]:
        """Fetch brand visual DNA for the client"""
        try:
            if not db.client:
                return {}
            
            response = db.client.table("brand_visual_dna")\
                .select("*")\
                .eq("client_id", client_id)\
                .single()\
                .execute()
            
            return response.data if response.data else {}
        except Exception as e:
            logger.warning(f"Could not fetch brand DNA: {e}")
            return {}
    
    async def _load_reference_images(self, image_ids: List[str]) -> List[Dict[str, Any]]:
        """Load reference images from the image bank"""
        if not image_ids or not db.client:
            return []
        
        try:
            response = db.client.table("brand_image_bank")\
                .select("id, image_url, category, storage_path")\
                .in_("id", image_ids)\
                .execute()
            
            images = []
            for img in (response.data or []):
                # Download image data
                img_data = await self._download_image(img['image_url'])
                if img_data:
                    images.append({
                        'id': img['id'],
                        'data': img_data,
                        'category': img['category'],
                        'mime_type': 'image/jpeg'
                    })
            
            return images
        except Exception as e:
            logger.error(f"Failed to load reference images: {e}")
            return []
    
    async def _load_product_image(self, image_id: str) -> Optional[Dict[str, Any]]:
        """Load a product image for high-fidelity preservation"""
        if not image_id or not db.client:
            return None
        
        try:
            response = db.client.table("brand_image_bank")\
                .select("id, image_url, category, storage_path, name")\
                .eq("id", image_id)\
                .single()\
                .execute()
            
            if response.data:
                img_data = await self._download_image(response.data['image_url'])
                if img_data:
                    return {
                        'id': response.data['id'],
                        'data': img_data,
                        'name': response.data.get('name', 'Product'),
                        'mime_type': 'image/jpeg'
                    }
            return None
        except Exception as e:
            logger.error(f"Failed to load product image: {e}")
            return None
    
    async def _download_image(self, url: str) -> Optional[bytes]:
        """Download image from URL"""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(url, timeout=30.0)
                response.raise_for_status()
                return response.content
        except Exception as e:
            logger.error(f"Failed to download image from {url}: {e}")
            return None
    
    async def _build_prompt(
        self,
        task: Dict[str, Any],
        brand_dna: Dict[str, Any],
        template_id: Optional[str],
        custom_prompt: str
    ) -> str:
        """Build the final prompt from task, brand DNA, and template"""
        
        # Get template if specified
        template = None
        if template_id and db.client:
            try:
                response = db.client.table("generation_templates")\
                    .select("*")\
                    .eq("id", template_id)\
                    .single()\
                    .execute()
                template = response.data
            except:
                pass
        
        # Build context dictionary for template substitution
        context = {
            # From task
            'task_title': task.get('title', ''),
            'format': task.get('format', 'post'),
            'selected_hook': task.get('selected_hook', ''),
            'key_elements': ', '.join(task.get('key_elements', [])) if isinstance(task.get('key_elements'), list) else str(task.get('key_elements', '')),
            'strategic_purpose': task.get('strategic_purpose', ''),
            'description': task.get('description', ''),
            
            # From brand DNA
            'brand_name': brand_dna.get('brand_essence', ''),
            'color_palette': self._format_colors(brand_dna),
            'mood': brand_dna.get('default_mood', 'professional'),
            'lighting': brand_dna.get('default_lighting', 'studio'),
            'style': brand_dna.get('default_style', 'natural'),
            
            # Exclusions
            'exclusions': ', '.join(brand_dna.get('always_exclude', ['text', 'watermarks', 'logos'])),
        }
        
        if template and template.get('prompt_template'):
            # Use template with substitutions
            prompt = template['prompt_template']
            for key, value in context.items():
                prompt = prompt.replace(f'{{{key}}}', str(value))
            
            # Add custom prompt
            if custom_prompt:
                prompt += f"\n\nAdditional instructions: {custom_prompt}"
        else:
            # Build prompt from scratch
            prompt = self._build_default_prompt(context, custom_prompt)
        
        # Always add the critical exclusion reminder
        prompt += "\n\nCRITICAL: Do not include any text, words, letters, numbers, watermarks, or logos in the image."
        
        return prompt
    
    def _format_colors(self, brand_dna: Dict[str, Any]) -> str:
        """Format brand colors for prompt"""
        colors = []
        if brand_dna.get('color_primary_name'):
            colors.append(brand_dna['color_primary_name'])
        if brand_dna.get('color_secondary_name'):
            colors.append(brand_dna['color_secondary_name'])
        if brand_dna.get('color_accent_name'):
            colors.append(brand_dna['color_accent_name'])
        
        return ', '.join(colors) if colors else 'professional color palette'
    
    def _build_default_prompt(self, context: Dict[str, Any], custom_prompt: str) -> str:
        """Build a default prompt when no template is selected"""
        parts = []
        
        # Main subject from task
        if context.get('description'):
            parts.append(context['description'])
        elif context.get('task_title'):
            parts.append(f"Image for: {context['task_title']}")
        
        # Key elements
        if context.get('key_elements'):
            parts.append(f"Featuring: {context['key_elements']}")
        
        # Style and mood
        parts.append(f"Style: {context.get('style', 'natural')}, {context.get('mood', 'professional')}")
        parts.append(f"Lighting: {context.get('lighting', 'studio')}")
        
        # Colors
        parts.append(f"Color palette: {context.get('color_palette', 'professional')}")
        
        # Custom additions
        if custom_prompt:
            parts.append(custom_prompt)
        
        # Technical
        parts.append("High quality, professional, suitable for social media advertising")
        
        return ". ".join(parts)
    
    async def _call_nanobanana_api(
        self,
        prompt: str,
        reference_images: List[Dict[str, Any]],
        product_image: Optional[Dict[str, Any]],
        aspect_ratio: str,
        resolution: str,
        model_key: str
    ) -> Tuple[bytes, List[str], str]:
        """
        Call the Vertex AI Imagen API for image generation.
        
        Returns:
            Tuple of (image_bytes, thinking_image_urls, revised_prompt)
        """
        model_config = self.MODELS[model_key]
        model_id = model_config['id']
        
        logger.info(f"🖼️ Calling Vertex AI {model_config['name']}: {model_id}")
        logger.info(f"   Aspect ratio: {aspect_ratio}")
        
        try:
            # Initialize model
            model = ImageGenerationModel.from_pretrained(model_id)
            
            # NOTE: Current Vertex AI implementation uses text-only prompts
            # We append info about references if needed, but direct image input 
            # requires using the Edit or Subject Reference APIs which are specific.
            # For now, we rely on the strong prompt instruction.
            
            # Generate
            # Note: resolution is not directly supported in generate_images as specific '2K/4K', 
            # but aspect_ratio is.
            response = model.generate_images(
                prompt=prompt,
                number_of_images=1,
                aspect_ratio=aspect_ratio,
                safety_filter_level="block_some",
                person_generation="allow_adult"
            )
            
            if not response or not response.images:
                raise ValueError("No image returned from Vertex AI")
                
            # Get the first image
            generated_image = response.images[0]
            image_data = generated_image._image_bytes # Access bytes directly
            
            logger.info(f"✅ Vertex AI returned image: {len(image_data)} bytes")
            
            # Imagen doesn't return thinking images or revised prompt in the same way
            return image_data, [], ""
            
        except Exception as e:
            logger.error(f"❌ NanoBanana/Vertex AI call failed: {e}")
            raise
    
    async def _save_to_storage(self, image_data: bytes, storage_path: str) -> str:
        """Save generated image to Supabase Storage"""
        try:
            storage_client = db.admin_client or db.client
            
            if not storage_client:
                # Fallback to data URL
                data_url = f"data:image/png;base64,{base64.b64encode(image_data).decode()}"
                logger.warning("⚠️ No Supabase client, returning data URL")
                return data_url
            
            # Upload to storage
            response = storage_client.storage.from_("generated-images").upload(
                path=storage_path,
                file=image_data,
                file_options={"content-type": "image/png", "upsert": "true"}
            )
            
            # Get public URL
            public_url = storage_client.storage.from_("generated-images").get_public_url(storage_path)
            
            logger.info(f"✅ Image saved to storage: {storage_path}")
            return public_url
            
        except Exception as e:
            logger.error(f"Storage upload failed: {e}")
            # Fallback to data URL
            data_url = f"data:image/png;base64,{base64.b64encode(image_data).decode()}"
            return data_url
    
    async def _save_to_database(
        self,
        image_id: str,
        client_id: str,
        task_id: str,
        template_id: Optional[str],
        base_prompt: str,
        final_prompt: str,
        revised_prompt: str,
        image_url: str,
        storage_path: str,
        aspect_ratio: str,
        resolution: str,
        model_used: str,
        reference_image_ids: List[str],
        product_image_id: Optional[str],
        thinking_images: List[str],
        generation_time_ms: int,
        brand_dna: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Save image metadata to database"""
        
        # Build reference images JSON
        reference_images_json = []
        for ref_id in reference_image_ids:
            reference_images_json.append({
                'image_bank_id': ref_id,
                'role': 'style'
            })
        if product_image_id:
            reference_images_json.append({
                'image_bank_id': product_image_id,
                'role': 'product'
            })
        
        record = {
            "id": image_id,
            "client_id": client_id,
            "task_id": task_id,
            "template_id": template_id,
            "base_prompt": base_prompt,
            "final_prompt": final_prompt,
            "revised_prompt": revised_prompt,
            "image_url": image_url,
            "storage_path": storage_path,
            "aspect_ratio": aspect_ratio,
            "resolution": resolution,
            "model_used": model_used,
            "reference_images": reference_images_json,
            "thinking_images": thinking_images,
            "generation_model": model_used,
            "cost_usd": self.MODELS.get('flash', {}).get('cost_per_image', 0.02),
            "generation_time_ms": generation_time_ms,
            "is_selected": False,
            "mood_tone": brand_dna.get('default_mood', ''),
            "style_preset": brand_dna.get('default_style', ''),
            "generation_params": {
                "aspect_ratio": aspect_ratio,
                "resolution": resolution,
                "model": model_used,
                "reference_count": len(reference_image_ids),
                "has_product": product_image_id is not None
            },
            "created_at": datetime.utcnow().isoformat()
        }
        
        try:
            if db.client:
                response = db.client.table("generated_images").insert(record).execute()
                logger.info(f"✅ Image metadata saved: {record['id']}")
                return response.data[0] if response.data else record
            else:
                return record
        except Exception as e:
            logger.error(f"Database save failed: {e}")
            return record
    
    async def get_templates(self, category: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get available generation templates"""
        try:
            if not db.client:
                return []
            
            query = db.client.table("generation_templates")\
                .select("*")\
                .eq("is_active", True)
            
            if category:
                query = query.eq("category", category)
            
            response = query.order("usage_count", desc=True).execute()
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Failed to fetch templates: {e}")
            return []
    
    async def get_pending_tasks(self, client_id: str) -> List[Dict[str, Any]]:
        """Get tasks that need image generation"""
        try:
            if not db.client:
                return []
            
            response = db.client.rpc(
                "get_pending_generation_tasks",
                {"p_client_id": client_id}
            ).execute()
            
            # Fallback if RPC doesn't exist
            if not response.data:
                response = db.client.table("tasks")\
                    .select("*")\
                    .eq("client_id", client_id)\
                    .in_("generation_status", ["pending", "rejected"])\
                    .neq("status", "HECHO")\
                    .order("execution_date", nullsfirst=False)\
                    .execute()
            
            return response.data if response.data else []
        except Exception as e:
            logger.error(f"Failed to fetch pending tasks: {e}")
            return []


# Singleton instance
nanobanana_service = NanoBananaService()
