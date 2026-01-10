"""
TTS Router
===========
Handles text-to-speech generation using Microsoft Edge TTS (free, high quality).
"""

import os
import uuid
import edge_tts
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse, Response
from pydantic import BaseModel
import tempfile

router = APIRouter(prefix="/tts", tags=["Text-to-Speech"])

class TTSRequest(BaseModel):
    text: str
    voice: str = "es-ES-AlvaroNeural"  # Default Spanish voice (Male)
    # Options: 
    # es-ES-AlvaroNeural (Male)
    # es-ES-ElviraNeural (Female)
    # es-MX-DaliaNeural (Female)
    # es-MX-JorgeNeural (Male)

@router.post("/generate")
async def generate_speech(request: TTSRequest):
    """
    Generates audio from text using Edge TTS.
    Returns the audio content as streaming bytes (audio/mpeg).
    """
    try:
        communicate = edge_tts.Communicate(request.text, request.voice)
        
        # Stream directly to memory buffer not to fill up disk
        audio_data = b""
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio_data += chunk["data"]
                
        return Response(content=audio_data, media_type="audio/mpeg")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/voices")
async def list_voices():
    """List recommended Spanish voices."""
    return {
        "recommended": [
            {"name": "es-ES-AlvaroNeural", "gender": "Male", "region": "Spain"},
            {"name": "es-ES-ElviraNeural", "gender": "Female", "region": "Spain"},
            {"name": "es-MX-DaliaNeural", "gender": "Female", "region": "Mexico"},
            {"name": "es-MX-JorgeNeural", "gender": "Male", "region": "Mexico"},
            {"name": "es-PE-CamilaNeural", "gender": "Female", "region": "Peru"},
            {"name": "es-PE-AlexNeural", "gender": "Male", "region": "Peru"}
        ]
    }
