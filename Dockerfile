FROM python:3.11-slim

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y gcc && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY backend_v2/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY backend_v2/app ./app

# Command
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port $PORT"]
