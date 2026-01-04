from api.database import SessionLocal
from api.models_tasks import Task, TaskStatus
from api import models

db = SessionLocal()
ficha = db.query(models.FichaCliente).filter(models.FichaCliente.brand_name == "Marca Demo").first()

new_tasks = [
    {
        "id": "task-demo-6", 
        "title": "Contactar influencer @foodielover", 
        "description": "Proponer colaboración detectada en análisis Q5. Micro-influencer con 50k seguidores y alto engagement.", 
        "area_estrategica": "Influencer Marketing", 
        "urgencia": "Alta", 
        "score_impacto": 8, 
        "score_esfuerzo": 3, 
        "prioridad": 1, 
        "week": 1, 
        "status": TaskStatus.PENDIENTE
    },
    {
        "id": "task-demo-7", 
        "title": "Responder 15 DMs pendientes", 
        "description": "Mensajes sin responder desde hace 48h. Priorizar consultas sobre disponibilidad de productos.", 
        "area_estrategica": "Community Management", 
        "urgencia": "Alta", 
        "score_impacto": 7, 
        "score_esfuerzo": 2, 
        "prioridad": 1, 
        "week": 1, 
        "status": TaskStatus.EN_CURSO
    },
    {
        "id": "task-demo-8", 
        "title": "Diseñar plantilla Stories promociones", 
        "description": "Crear template reutilizable en Canva para anuncios de descuentos y ofertas flash.", 
        "area_estrategica": "Diseño", 
        "urgencia": "Media", 
        "score_impacto": 6, 
        "score_esfuerzo": 4, 
        "prioridad": 2, 
        "week": 2, 
        "status": TaskStatus.PENDIENTE
    },
    {
        "id": "task-demo-9", 
        "title": "Configurar campaña retargeting Facebook", 
        "description": "Lanzar anuncios para usuarios que visitaron web pero no compraron. Presupuesto: 500 USD.", 
        "area_estrategica": "Paid Media", 
        "urgencia": "Alta", 
        "score_impacto": 9, 
        "score_esfuerzo": 5, 
        "prioridad": 1, 
        "week": 2, 
        "status": TaskStatus.PENDIENTE
    },
    {
        "id": "task-demo-10", 
        "title": "Grabar 3 videos TikTok", 
        "description": "Contenido behind-the-scenes del proceso de producción. Formato vertical, duración 30-60s.", 
        "area_estrategica": "Contenido", 
        "urgencia": "Media", 
        "score_impacto": 8, 
        "score_esfuerzo": 6, 
        "prioridad": 2, 
        "week": 3, 
        "status": TaskStatus.PENDIENTE
    },
]

for t in new_tasks:
    existing = db.query(Task).filter(Task.id == t["id"]).first()
    if not existing:
        task = Task(ficha_cliente_id=ficha.id, **t)
        db.add(task)
        print(f"✅ Creada: {t['title']}")
    else:
        print(f"⏭️ Ya existe: {t['title']}")

db.commit()
db.close()
print("🎉 Tareas de prueba completadas!")
