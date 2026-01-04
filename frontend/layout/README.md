# Pixely Partners Frontend

Frontend React + TypeScript + Vite para la plataforma de análisis de redes sociales.

## Stack Tecnológico

- **React 19** - Framework UI
- **TypeScript 5.8** - Type safety
- **Vite 6** - Build tool
- **Recharts** - Visualización de datos
- **Lucide React** - Iconos

## Instalación

```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build producción
npm run build

# Preview build
npm run preview
```

## Configuración

Crea un archivo `.env` basado en `.env.example`:

```env
VITE_API_URL=http://localhost:8000
```

## Estructura

```
frontend/layout/
├── components/          # Componentes React
│   ├── CardLabsQ1-Q8    # Visualizaciones Q1-Q10
│   ├── LabView.tsx      # Vista principal del Lab
│   ├── LoginComponents  # Login y animaciones
│   ├── Sidebar.tsx      # Navegación lateral
│   └── ...
├── contexts/            # React Contexts
│   └── AuthContext.tsx  # Estado de autenticación
├── hooks/               # Custom hooks
│   └── useAnalysis.tsx  # Datos Q1-Q10
├── services/            # Servicios API
│   └── api.ts           # Llamadas al backend
├── App.tsx              # Componente principal
└── index.tsx            # Entry point
```

## Conexión con Backend

El frontend se conecta al backend FastAPI en:
- **Auth**: `POST /token` (OAuth2)
- **Analysis**: `POST /semantic/analyze/{client_id}`
- **Context**: `GET/POST /semantic/context/{client_id}`
- **Chat**: `POST /semantic/chat/{client_id}/{session_id}`

## Desarrollo

Para desarrollo local con el backend:

1. Iniciar backend: `docker compose up -d` (en `/backend`)
2. Iniciar frontend: `npm run dev`
3. Abrir http://localhost:5173

## Visualizaciones Q1-Q10

| Card | Análisis | Descripción |
|------|----------|-------------|
| Q1 | Emociones | Radar de Plutchik (8 emociones) |
| Q2 | Personalidad | Pentágono Aaker (5 dimensiones) |
| Q3 | Tópicos | Top temas con sentimiento |
| Q4 | Marcos Narrativos | Distribución Positivo/Negativo/Aspiracional |
| Q5 | Influencers | Ranking por centralidad |
| Q6 | Oportunidades | Matriz gap vs capacidad |
| Q7 | Sentimiento | Barras de distribución |
| Q8 | Temporal | Evolución semanal |
