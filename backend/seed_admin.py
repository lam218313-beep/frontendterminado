from sqlalchemy.orm import Session
from api.database import SessionLocal, engine, Base
from api import models, security
import uuid

def seed_admin():
    db = SessionLocal()
    try:
        # 1. Check if Tenant exists, if not create one
        tenant_name = "Pixely HQ"
        tenant = db.query(models.Tenant).filter(models.Tenant.name == tenant_name).first()
        if not tenant:
            print(f"Creating Tenant: {tenant_name}")
            tenant = models.Tenant(name=tenant_name)
            db.add(tenant)
            db.commit()
            db.refresh(tenant)
        else:
            print(f"Tenant {tenant_name} already exists.")

        # 2. Check if Admin User exists
        admin_email = "admin@pixely.com"
        user = db.query(models.User).filter(models.User.email == admin_email).first()
        
        if not user:
            print(f"Creating Admin User: {admin_email}")
            hashed_pwd = security.get_password_hash("admin123")
            user = models.User(
                email=admin_email,
                hashed_password=hashed_pwd,
                full_name="Super Admin",
                role="admin",
                tenant_id=tenant.id
            )
            db.add(user)
            db.commit()
            print("✅ Admin user created successfully!")
            print("Email: admin@pixely.com")
            print("Password: admin123")
        else:
            print(f"User {admin_email} already exists. Updating password...")
            hashed_pwd = security.get_password_hash("admin123")
            user.hashed_password = hashed_pwd
            db.commit()
            print("✅ Admin password updated to: admin123")
            
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🌱 Seeding Database...")
    seed_admin()
