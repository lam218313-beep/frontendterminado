#!/bin/bash
# =============================================================================
# Pixely Partners - API Entrypoint
# =============================================================================
# Este script se ejecuta al iniciar el contenedor API.
# 1. Espera a que PostgreSQL esté listo
# 2. Inicializa la base de datos (tablas + migraciones + seed)
# 3. Inicia el servidor FastAPI
# =============================================================================

set -e

echo "=============================================="
echo "🚀 Pixely Partners API Starting..."
echo "=============================================="

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
while ! pg_isready -h db -p 5432 -U ${POSTGRES_USER:-pixely_user} -q; do
    sleep 1
done
echo "✅ PostgreSQL is ready!"

# Initialize database (create tables, run migrations, seed data)
echo ""
echo "📋 Initializing database..."
python init_db.py

# Start FastAPI server
echo ""
echo "🌐 Starting FastAPI server..."
exec uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
