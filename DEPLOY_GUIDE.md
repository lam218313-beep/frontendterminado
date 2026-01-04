# Guía de Despliegue - Pixely Partners

## 1. Credenciales Generadas

### Usuario Administrador
- **Email:** `admin@pixely.com`
- **Password:** `admin123`

### Usuario Cliente (Demo)
- **Email:** `cliente@pixely.com`
- **Password:** `cliente123`
- **Marca:** "Marca Demo"

## 2. Estado del Sistema

- **Base de Datos:** Migrada a Supabase (Producción).
- **Backend API:** Configurado para conectar a Supabase.
- **Frontend:** Compilado en `frontend/layout/dist`.

## 3. Ejecución del Orquestador

El orquestador semántico está integrado en la API. Para utilizarlo:
1. Inicie sesión con el usuario cliente.
2. Vaya a la sección "Semantic Lab" o "Chat".
3. Suba archivos (PDF, TXT) para ingerir contexto.
4. Realice consultas en el chat.

## 4. Despliegue en Google Cloud VM (Compute Engine)

### Prerrequisitos
- Una instancia VM (e.g., e2-medium, Ubuntu 22.04).
- Puertos abiertos: 80 (HTTP), 443 (HTTPS), 8000 (API).

### Paso 1: Preparar la VM
Conéctese por SSH a su VM e instale Docker y Nginx:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose nginx
sudo usermod -aG docker $USER
# (Cierre sesión y vuelva a entrar para aplicar cambios de grupo)
```

### Paso 2: Subir el Backend
Copie la carpeta `backend` a la VM.

```bash
# Desde su máquina local
scp -r backend usuario@IP_VM:~/pixely-backend
```

En la VM, inicie el backend con Docker:

```bash
cd ~/pixely-backend
# Asegúrese de que el archivo .env tenga la URL de Supabase correcta
docker-compose up -d --build api
```

### Paso 3: Subir el Frontend
Copie la carpeta `dist` (generada con `npm run build`) a la VM.

```bash
# Desde su máquina local (en frontend/layout)
scp -r dist usuario@IP_VM:~/pixely-frontend
```

Mueva los archivos a la carpeta web de Nginx:

```bash
# En la VM
sudo rm -rf /var/www/html/*
sudo cp -r ~/pixely-frontend/* /var/www/html/
```

### Paso 4: Configurar Nginx (Reverse Proxy)
Edite la configuración de Nginx para servir el frontend y redirigir la API.

```bash
sudo nano /etc/nginx/sites-available/default
```

Reemplace el contenido con:

```nginx
server {
    listen 80;
    server_name su-dominio.com_o_IP;

    root /var/www/html;
    index index.html;

    # Frontend (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API Proxy
    location /api/ {
        proxy_pass http://localhost:8000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Semantic Endpoints Proxy
    location /semantic/ {
        proxy_pass http://localhost:8000/semantic/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    # Token Endpoint Proxy
    location /token {
        proxy_pass http://localhost:8000/token;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Reinicie Nginx:
```bash
sudo systemctl restart nginx
```

¡Listo! Su sistema debería estar accesible en la IP de la VM.
