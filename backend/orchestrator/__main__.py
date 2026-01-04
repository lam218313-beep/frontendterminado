"""
Orchestrator Module - DEPRECATED
================================

⚠️ AVISO: Este módulo ha sido DEPRECADO.

El sistema de análisis Q1-Q10 basado en OpenAI ha sido reemplazado por el 
Semantic Orchestrator que utiliza Google Gemini 3 Flash Preview con Context Caching.

NUEVO FLUJO:
1. Los archivos (PDF, imágenes) se suben via API REST: POST /semantic/context/ingest
2. Los archivos se cachean automáticamente en Gemini con TTL de 60 minutos
3. Las consultas se realizan via chatbot: POST /semantic/chat/{session_id}
4. El sistema genera respuestas contextualizadas basadas en los documentos subidos

VER:
- backend/orchestrator/semantic_orchestrator.py  (Nuevo módulo principal)
- backend/api/routes_semantic.py                 (Endpoints REST)
- backend/orchestrator/LEGACY_PROMPTS.md         (Prompts extraídos del sistema antiguo)
- backend/ARQUITECTURA.md                        (Documentación de la arquitectura)

Los prompts del sistema legacy (Q1-Q10) han sido preservados en LEGACY_PROMPTS.md
para su uso en el frontend u otros componentes.
"""

import logging

logger = logging.getLogger(__name__)

def main():
    """
    Deprecated entry point.
    """
    logger.warning("="*80)
    logger.warning("⚠️  DEPRECATED: El orchestrator Q1-Q10 ha sido reemplazado.")
    logger.warning("   Use la API REST con SemanticOrchestrator en su lugar:")
    logger.warning("   - POST /semantic/context/ingest  (subir archivos)")
    logger.warning("   - POST /semantic/chat/{session_id} (chatbot)")
    logger.warning("   Ver: backend/ARQUITECTURA.md para más información.")
    logger.warning("="*80)


if __name__ == "__main__":
    main()
