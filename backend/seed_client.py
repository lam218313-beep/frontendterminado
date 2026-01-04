from sqlalchemy.orm import Session
from api.database import SessionLocal, engine, Base
from api import models, security
from api.models_tasks import Task, TaskStatus
import uuid

# Sample tasks data
SAMPLE_TASKS = [
    {
        "title": "Optimizar perfil de Instagram",
        "description": "Revisar y actualizar la biografía, enlace en bio y destacados de Instagram para reflejar la nueva identidad de marca.",
        "area_estrategica": "Branding",
        "urgencia": "Alta",
        "score_impacto": 8,
        "score_esfuerzo": 3,
        "prioridad": 1,
        "week": 1,
        "status": TaskStatus.PENDIENTE
    },
    {
        "title": "Crear calendario de contenido mensual",
        "description": "Desarrollar un calendario editorial con 12 publicaciones planificadas para el próximo mes, incluyendo fechas clave y formatos.",
        "area_estrategica": "Contenido",
        "urgencia": "Media",
        "score_impacto": 9,
        "score_esfuerzo": 5,
        "prioridad": 2,
        "week": 1,
        "status": TaskStatus.EN_CURSO
    },
    {
        "title": "Responder comentarios negativos pendientes",
        "description": "Identificar y responder de forma profesional a los 5 comentarios negativos más recientes en las publicaciones de la última semana.",
        "area_estrategica": "Community Management",
        "urgencia": "Alta",
        "score_impacto": 7,
        "score_esfuerzo": 2,
        "prioridad": 1,
        "week": 2,
        "status": TaskStatus.HECHO
    },
    {
        "title": "Analizar métricas de engagement Q4",
        "description": "Generar un reporte comparativo del engagement de los últimos 3 meses vs el trimestre anterior, identificando tendencias.",
        "area_estrategica": "Analítica",
        "urgencia": "Baja",
        "score_impacto": 6,
        "score_esfuerzo": 4,
        "prioridad": 3,
        "week": 3,
        "status": TaskStatus.PENDIENTE
    },
    {
        "title": "Lanzar campaña de UGC",
        "description": "Diseñar y lanzar una campaña de contenido generado por usuarios con hashtag propio y premios para los mejores posts.",
        "area_estrategica": "Campañas",
        "urgencia": "Media",
        "score_impacto": 9,
        "score_esfuerzo": 7,
        "prioridad": 2,
        "week": 4,
        "status": TaskStatus.PENDIENTE
    }
]

def seed_client():
    db = SessionLocal()
    try:
        print("🌱 Seeding Client Data...")
        
        # 1. Get Tenant
        tenant_name = "Pixely HQ"
        tenant = db.query(models.Tenant).filter(models.Tenant.name == tenant_name).first()
        if not tenant:
            print(f"❌ Tenant {tenant_name} not found. Run seed_admin.py first.")
            return

        # 2. Create Client User
        client_email = "cliente@pixely.com"
        user = db.query(models.User).filter(models.User.email == client_email).first()
        
        if not user:
            print(f"Creating Client User: {client_email}")
            hashed_pwd = security.get_password_hash("cliente123")
            user = models.User(
                email=client_email,
                hashed_password=hashed_pwd,
                full_name="Cliente Demo",
                role="analyst",
                tenant_id=tenant.id
            )
            db.add(user)
            db.commit()
            print("✅ Client user created successfully!")
            print("Email: cliente@pixely.com")
            print("Password: cliente123")
        else:
            print(f"User {client_email} already exists. Updating password...")
            hashed_pwd = security.get_password_hash("cliente123")
            user.hashed_password = hashed_pwd
            db.commit()
            print("✅ Client password updated to: cliente123")

        # 3. Create FichaCliente (Demo Brand)
        brand_name = "Marca Demo"
        ficha = db.query(models.FichaCliente).filter(
            models.FichaCliente.brand_name == brand_name,
            models.FichaCliente.tenant_id == tenant.id
        ).first()

        if not ficha:
            print(f"Creating Demo Brand: {brand_name}")
            ficha = models.FichaCliente(
                brand_name=brand_name,
                industry="Tecnología",
                brand_archetype="Creador",
                tone_of_voice="Innovador y Cercano",
                target_audience="Emprendedores y Startups",
                competitors=["Competidor A", "Competidor B"],
                tenant_id=tenant.id
            )
            db.add(ficha)
            db.commit()
            print("✅ Demo Brand created successfully!")
        else:
            print(f"Brand {brand_name} already exists.")

        # 4. Create Sample Tasks for Demo Brand
        print("📋 Seeding sample tasks...")
        existing_tasks = db.query(Task).filter(Task.ficha_cliente_id == ficha.id).count()
        
        if existing_tasks > 0:
            print(f"   ℹ️ {existing_tasks} tasks already exist for '{brand_name}'. Skipping.")
        else:
            for i, task_data in enumerate(SAMPLE_TASKS):
                task = Task(
                    id=f"task-demo-{i+1}",
                    ficha_cliente_id=ficha.id,
                    **task_data
                )
                db.add(task)
            db.commit()
            print(f"   ✅ Created {len(SAMPLE_TASKS)} sample tasks for '{brand_name}'")
            
    except Exception as e:
        print(f"❌ Error seeding client: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_client()
