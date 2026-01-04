from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
import shutil
import os
import uuid

from .database import get_db
from . import models
from .dependencies import get_current_user
from orchestrator.semantic_orchestrator import SemanticOrchestrator

router = APIRouter(
    prefix="/semantic",
    tags=["Semantic Orchestrator"],
    responses={404: {"description": "Not found"}},
)

@router.get("/clients")
def get_clients(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    List all clients (FichaCliente) for the current user's tenant.
    """
    clients = db.query(models.FichaCliente).filter(
        models.FichaCliente.tenant_id == current_user.tenant_id
    ).all()
    
    return [{"id": str(c.id), "nombre": c.brand_name, "industry": c.industry, "is_active": c.is_active} for c in clients]


@router.post("/clients")
def create_client(
    brand_name: str = Form(...),
    industry: str = Form(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Create a new client (FichaCliente) for the current user's tenant.
    """
    new_client = models.FichaCliente(
        tenant_id=current_user.tenant_id,
        brand_name=brand_name,
        industry=industry
    )
    db.add(new_client)
    db.commit()
    db.refresh(new_client)
    
    return {"id": str(new_client.id), "nombre": new_client.brand_name, "industry": new_client.industry, "is_active": new_client.is_active}


@router.delete("/clients/{client_id}")
def delete_client(
    client_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Delete a client (FichaCliente) - Admin only.
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete clients")
    
    client = db.query(models.FichaCliente).filter(
        models.FichaCliente.id == client_id,
        models.FichaCliente.tenant_id == current_user.tenant_id
    ).first()
    
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    db.delete(client)
    db.commit()
    
    return {"message": f"Client {client.brand_name} deleted successfully"}

# --- INGESTION ---

@router.post("/ingest/{client_id}")
async def ingest_context(
    client_id: str,
    file: UploadFile = File(...),
    category: str = Form("General"),
    db: Session = Depends(get_db)
):
    """
    Uploads a document (Excel, CSV, PDF, etc.) for a specific client.
    Triggers the Semantic Orchestrator to:
    1. Save file locally (temp)
    2. Upload to Gemini
    3. REGENERATE Context Cache with ALL client files
    """
    # Validate Client
    client = db.query(models.FichaCliente).filter(models.FichaCliente.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")

    # Save temp file
    temp_dir = "orchestrator/inputs/temp"
    os.makedirs(temp_dir, exist_ok=True)
    
    # Keep original filename for clarity in Gemini
    safe_filename = "".join([c for c in file.filename if c.isalnum() or c in "._- "])
    temp_path = os.path.join(temp_dir, f"{client_id}_{uuid.uuid4()}_{safe_filename}")
    
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    try:
        orchestrator = SemanticOrchestrator(db)
        ai_context = orchestrator.ingest_context(client_id, temp_path, category=category)
        
        return {
            "status": "success",
            "message": "File ingested and Context Cache updated",
            "context_id": ai_context.id,
            "cache_active": bool(ai_context.gemini_cache_name),
            "cache_name": ai_context.gemini_cache_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup is handled in orchestrator, but double check
        if os.path.exists(temp_path):
            os.remove(temp_path)

# --- CHAT ---

@router.post("/chat/{client_id}/session")
def create_chat_session(
    client_id: str,
    title: str = "Nueva Conversación",
    db: Session = Depends(get_db)
):
    """Creates a new chat session for the client"""
    session = models.ChatSession(
        ficha_cliente_id=client_id,
        title=title
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/chat/{client_id}/sessions")
def get_chat_sessions(client_id: str, db: Session = Depends(get_db)):
    """List all chat sessions for a client"""
    sessions = db.query(models.ChatSession).filter(
        models.ChatSession.ficha_cliente_id == client_id
    ).order_by(models.ChatSession.last_message_at.desc()).all()
    return sessions

@router.get("/chat/session/{session_id}/messages")
def get_session_messages(session_id: str, db: Session = Depends(get_db)):
    """Get message history for a session"""
    messages = db.query(models.ChatMessage).filter(
        models.ChatMessage.session_id == session_id
    ).order_by(models.ChatMessage.timestamp).all()
    return messages

@router.post("/chat/{client_id}/{session_id}")
def send_chat_message(
    client_id: str,
    session_id: str,
    message: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Sends a message to the Semantic Orchestrator.
    Returns the AI response.
    """
    orchestrator = SemanticOrchestrator(db)
    try:
        response = orchestrator.chat(client_id, session_id, message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- CHARTS ---

@router.post("/chart/{client_id}")
def generate_chart(
    client_id: str,
    requirements: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Generates a chart configuration (JSON) based on requirements.
    """
    orchestrator = SemanticOrchestrator(db)
    try:
        chart_data = orchestrator.generate_chart_data(client_id, requirements)
        return chart_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- FULL ANALYSIS (Q1-Q10) ---

@router.post("/analyze/{client_id}")
def run_full_analysis(
    client_id: str,
    db: Session = Depends(get_db)
):
    """
    Executes the complete Q1-Q10 analysis pipeline using Gemini.
    
    Returns structured JSON with all 10 analysis outputs:
    - Q1: Emociones (Plutchik)
    - Q2: Personalidad de Marca (Aaker)
    - Q3: Tópicos Principales
    - Q4: Marcos Narrativos (Entman)
    - Q5: Influenciadores
    - Q6: Oportunidades
    - Q7: Sentimiento Detallado
    - Q8: Análisis Temporal
    - Q9: Recomendaciones Estratégicas
    - Q10: Resumen Ejecutivo
    
    Requires files to be uploaded first via POST /semantic/ingest/{client_id}
    """
    # Validate Client
    client = db.query(models.FichaCliente).filter(models.FichaCliente.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    orchestrator = SemanticOrchestrator(db)
    try:
        results = orchestrator.generate_full_analysis(client_id)
        return results
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# --- CONTEXT STATUS ---

@router.get("/context/{client_id}")
def get_context_status(
    client_id: str,
    db: Session = Depends(get_db)
):
    """
    Get the current context status for a client.
    Shows cache info and uploaded files.
    """
    ai_context = db.query(models.AIContext).filter(
        models.AIContext.ficha_cliente_id == client_id
    ).first()
    
    if not ai_context:
        return {
            "status": "no_context",
            "message": "No context found. Upload files first.",
            "files": [],
            "cache_active": False
        }
    
    # Get files
    files = db.query(models.ContextFile).filter(
        models.ContextFile.ai_context_id == ai_context.id
    ).all()
    
    return {
        "status": "active",
        "context_id": str(ai_context.id),
        "cache_active": bool(ai_context.gemini_cache_name),
        "cache_name": ai_context.gemini_cache_name,
        "last_updated": ai_context.last_updated.isoformat() if ai_context.last_updated else None,
        "files": [
            {
                "id": str(f.id),
                "filename": f.filename,
                "category": f.category,
                "uploaded_at": f.uploaded_at.isoformat() if f.uploaded_at else None
            }
            for f in files
        ]
    }


# --- GET LATEST ANALYSIS ---

@router.get("/analysis/{client_id}")
def get_latest_analysis(
    client_id: str,
    db: Session = Depends(get_db)
):
    """
    Get the latest Q1-Q10 analysis results for a client.
    Returns the most recent analysis from the database.
    """
    # Validate Client
    client = db.query(models.FichaCliente).filter(models.FichaCliente.id == client_id).first()
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    
    # Get latest insight
    insight = db.query(models.SocialMediaInsight).filter(
        models.SocialMediaInsight.cliente_id == client_id
    ).order_by(models.SocialMediaInsight.created_at.desc()).first()
    
    if not insight:
        return {
            "status": "no_analysis",
            "message": "No analysis found. Run analysis first via POST /semantic/analyze/{client_id}",
            "data": None
        }
    
    # Transform Q1 data to frontend format
    q1_data = insight.q1_emociones or {}
    q1_results = q1_data.get('results', {})
    emociones_list = [
        {"name": "Alegría", "value": int(q1_results.get('Alegría', 0) * 100)},
        {"name": "Confianza", "value": int(q1_results.get('Confianza', 0) * 100)},
        {"name": "Miedo", "value": int(q1_results.get('Miedo', 0) * 100)},
        {"name": "Sorpresa", "value": int(q1_results.get('Sorpresa', 0) * 100)},
        {"name": "Tristeza", "value": int(q1_results.get('Tristeza', 0) * 100)},
        {"name": "Aversión", "value": int(q1_results.get('Aversión', 0) * 100)},
        {"name": "Ira", "value": int(q1_results.get('Ira', 0) * 100)},
        {"name": "Anticipación", "value": int(q1_results.get('Anticipación', 0) * 100)},
    ]
    
    # Transform Q2 data
    q2_data = insight.q2_personalidad or {}
    q2_results = q2_data.get('results', {})
    personality_data = {
        "Sinceridad": int(q2_results.get('Sinceridad', 0) * 100) if isinstance(q2_results.get('Sinceridad'), float) and q2_results.get('Sinceridad', 0) <= 1 else int(q2_results.get('Sinceridad', 0)),
        "Emocion": int(q2_results.get('Emocion', q2_results.get('Emoción', 0)) * 100) if isinstance(q2_results.get('Emocion', q2_results.get('Emoción', 0)), float) and q2_results.get('Emocion', q2_results.get('Emoción', 0)) <= 1 else int(q2_results.get('Emocion', q2_results.get('Emoción', 0))),
        "Competencia": int(q2_results.get('Competencia', 0) * 100) if isinstance(q2_results.get('Competencia'), float) and q2_results.get('Competencia', 0) <= 1 else int(q2_results.get('Competencia', 0)),
        "Sofisticacion": int(q2_results.get('Sofisticacion', q2_results.get('Sofisticación', 0)) * 100) if isinstance(q2_results.get('Sofisticacion', q2_results.get('Sofisticación', 0)), float) and q2_results.get('Sofisticacion', q2_results.get('Sofisticación', 0)) <= 1 else int(q2_results.get('Sofisticacion', q2_results.get('Sofisticación', 0))),
        "Rudeza": int(q2_results.get('Rudeza', 0) * 100) if isinstance(q2_results.get('Rudeza'), float) and q2_results.get('Rudeza', 0) <= 1 else int(q2_results.get('Rudeza', 0)),
    }
    
    # Transform Q3: map to analisis_agregado format for CardLabsQ3
    q3_raw = insight.q3_topicos or {}
    q3_results = q3_raw.get('results', {})
    # Handle both new format (analisis_agregado) and old format (temas_principales)
    q3_topics = q3_results.get('analisis_agregado', [])
    if not q3_topics and 'temas_principales' in q3_results:
        # Convert old format to new format
        q3_topics = [
            {
                "topic": t.get('tema', ''),
                "frecuencia_relativa": int(t.get('porcentaje', 0) * 100),
                "sentimiento_promedio": t.get('sentimiento', 0)
            }
            for t in q3_results.get('temas_principales', [])
        ]
    q3_formatted = {
        "results": {
            "analisis_agregado": q3_topics
        }
    }
    
    # Transform Q4: map to Positivo/Negativo/Aspiracional format for CardLabsQ4
    q4_raw = insight.q4_marcos_narrativos or {}
    q4_results = q4_raw.get('results', {})
    # Handle both new format and old Entman format
    q4_agg = q4_results.get('analisis_agregado', None)
    if q4_agg is None:
        # Convert Entman frames to emotional frames (approximation)
        positivo = (q4_results.get('Interés Humano', 0) + 100 - q4_results.get('Conflicto', 0)) / 200
        negativo = (q4_results.get('Conflicto', 0) + q4_results.get('Moralidad', 0)) / 200
        aspiracional = (q4_results.get('Consecuencias Económicas', 0) + q4_results.get('Atribución de Responsabilidad', 0)) / 200
        total = positivo + negativo + aspiracional
        if total > 0:
            positivo, negativo, aspiracional = positivo/total, negativo/total, aspiracional/total
        q4_agg = {"Positivo": round(positivo, 2), "Negativo": round(negativo, 2), "Aspiracional": round(aspiracional, 2)}
    q4_evol = q4_results.get('evolucion_temporal', [
        {"semana": 1, "marcos_distribucion": {"Positivo": 0.4, "Negativo": 0.3, "Aspiracional": 0.3}},
        {"semana": 2, "marcos_distribucion": {"Positivo": 0.42, "Negativo": 0.28, "Aspiracional": 0.3}},
        {"semana": 3, "marcos_distribucion": {"Positivo": 0.45, "Negativo": 0.25, "Aspiracional": 0.3}},
        {"semana": 4, "marcos_distribucion": {"Positivo": 0.48, "Negativo": 0.22, "Aspiracional": 0.3}},
        {"semana": 5, "marcos_distribucion": {"Positivo": 0.5, "Negativo": 0.2, "Aspiracional": 0.3}},
    ])
    q4_formatted = {
        "results": {
            "analisis_agregado": q4_agg,
            "evolucion_temporal": q4_evol
        }
    }
    
    # Transform Q5: map to influenciadores_globales format for CardLabsQ5
    q5_raw = insight.q5_influenciadores or {}
    q5_results = q5_raw.get('results', {})
    q5_influencers = q5_results.get('influenciadores_globales', [])
    if not q5_influencers and 'voces_influyentes' in q5_results:
        # Convert old format to new format
        q5_influencers = [
            {
                "username": "@" + v.get('usuario', '').replace('@', ''),
                "autoridad_promedio": min(95, 50 + v.get('likes_totales', 0) // 2),
                "afinidad_promedio": 70 if v.get('tipo_influencia') != 'Critic' else 40,
                "menciones": v.get('frecuencia_comentarios', 0),
                "score_centralidad": min(0.95, 0.5 + v.get('likes_totales', 0) / 200),
                "sentimiento": 0.6 if v.get('tipo_influencia') == 'Autoridad' else 0.3,
                "comentario_evidencia": v.get('razon', '')[:100]
            }
            for v in q5_results.get('voces_influyentes', [])
        ]
    q5_formatted = {
        "results": {
            "influenciadores_globales": q5_influencers
        }
    }
    
    # Transform Q6: map to oportunidades format with scores for CardLabsQ6
    q6_raw = insight.q6_oportunidades or {}
    q6_results = q6_raw.get('results', {})
    q6_opps = q6_results.get('oportunidades', [])
    # Add gap_score and competencia_score if missing
    potencial_map = {"Alto": (85, 80), "Medio": (60, 50), "Bajo": (30, 30)}
    for opp in q6_opps:
        if 'gap_score' not in opp:
            pot = opp.get('potencial', 'Medio')
            scores = potencial_map.get(pot, (50, 50))
            opp['gap_score'] = scores[0]
            opp['competencia_score'] = scores[1]
        if 'recomendacion_accion' not in opp:
            opp['recomendacion_accion'] = opp.get('descripcion', '')[:60]
        if 'detalle' not in opp:
            opp['detalle'] = opp.get('descripcion', '')[:60]
    q6_formatted = {
        "results": {
            "oportunidades": q6_opps
        }
    }
    
    # Transform Q7: wrap in results.analisis_agregado with all required fields
    q7_raw = insight.q7_sentimiento or {}
    q7_results = q7_raw.get('results', {})
    q7_agg = q7_results.get('analisis_agregado', {})
    # Ensure all required fields exist
    q7_formatted = {
        "results": {
            "analisis_agregado": {
                "Positivo": q7_agg.get('Positivo', 0.25),
                "Negativo": q7_agg.get('Negativo', 0.25),
                "Neutral": q7_agg.get('Neutral', 0.25),
                "Mixto": q7_agg.get('Mixto', 0.25),
                "subjetividad_promedio_global": q7_agg.get('subjetividad_promedio_global', 0.65),
                "ejemplo_mixto": q7_agg.get('ejemplo_mixto', "Buen servicio pero el precio podría ser más competitivo.")
            }
        }
    }
    
    # Transform Q8: map to serie_temporal_semanal format for CardLabsQ8
    q8_raw = insight.q8_temporal or {}
    q8_results = q8_raw.get('results', {})
    q8_serie = q8_results.get('serie_temporal_semanal', [])
    if not q8_serie and 'patrones_temporales' in q8_results:
        # Convert old format to new format
        patrones = q8_results.get('patrones_temporales', [])
        q8_serie = [
            {
                "fecha_semana": f"Sem {i+1}",
                "porcentaje_positivo": p.get('sentimiento_promedio', 0.5),
                "engagement": 1000 + i * 200,
                "topico_principal": p.get('topico_principal', '')[:30]
            }
            for i, p in enumerate(patrones)
        ]
        # Pad to 5 weeks if needed
        while len(q8_serie) < 5:
            idx = len(q8_serie)
            q8_serie.append({
                "fecha_semana": f"Sem {idx+1}",
                "porcentaje_positivo": 0.5,
                "engagement": 1000,
                "topico_principal": "Análisis General"
            })
    q8_formatted = {
        "results": {
            "serie_temporal_semanal": q8_serie,
            "resumen_global": q8_results.get('resumen_global', {"tendencia": "Estable"})
        }
    }
    
    return {
        "status": "success",
        "analysis_id": str(insight.id),
        "analysis_date": insight.analysis_date.isoformat() if insight.analysis_date else None,
        "Q1": {"emociones": emociones_list},
        "Q2": {"resumen_global_personalidad": personality_data},
        "Q3": q3_formatted,
        "Q4": q4_formatted,
        "Q5": q5_formatted,
        "Q6": q6_formatted,
        "Q7": q7_formatted,
        "Q8": q8_formatted,
        "Q9": insight.q9_recomendaciones or {},
        "Q10": insight.q10_resumen or {},
    }