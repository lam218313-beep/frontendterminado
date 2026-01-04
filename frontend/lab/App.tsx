import React from 'react';
import { 
    ActiveCourseCard
} from './components/Widgets';
import { CardLabsHeader } from './components/CardLabsHeader.tsx';
import { CardLabsQ1_Emotions } from './components/CardLabsQ1_Emotions.tsx';
import { CardLabsQ2_Personality } from './components/CardLabsQ2_Personality.tsx';
import { CardLabsQ3_TopTopics } from './components/CardLabsQ3_TopTopics.tsx';
import { CardLabsQ3_ConclusionGauge } from './components/CardLabsQ3_ConclusionGauge.tsx';
import { CardLabsQ4_NarrativeFrames } from './components/CardLabsQ4_NarrativeFrames.tsx';
import { CardLabsQ5_InfluencerRanking } from './components/CardLabsQ5_InfluencerRanking.tsx';
import { CardLabsQ6_OpportunitiesMatrix } from './components/CardLabsQ6_OpportunitiesMatrix.tsx';
import { CardLabsQ7_SentimentBars } from './components/CardLabsQ7_SentimentBars.tsx';
import { CardLabsQ8_TemporalEvolution } from './components/CardLabsQ8_TemporalEvolution.tsx';
import { ActiveCourse } from './types';

// Data Mock
const activeCourses: ActiveCourse[] = [
    { id: 'c1', title: '3D Design Course', instructor: 'Micheal Andrew', remaining: '8h 45 min', progress: 45, thumbnail: 'https://picsum.photos/id/40/200/200' },
    { id: 'c2', title: 'Development Basics', instructor: 'Natalia Varnan', remaining: '18h 12 min', progress: 75, thumbnail: 'https://picsum.photos/id/60/200/200' },
];

// Mock Data for the Emotions Card (Plutchik's Wheel)
const emotionsData = {
  emociones: [
    { name: 'Alegría', value: 85 },
    { name: 'Confianza', value: 62 },
    { name: 'Miedo', value: 30 },
    { name: 'Sorpresa', value: 75 },
    { name: 'Tristeza', value: 20 },
    { name: 'Aversión', value: 15 },
    { name: 'Ira', value: 45 },
    { name: 'Anticipación', value: 90 }
  ]
};

// Mock Data for Personality Card (Pentagonal Radar)
const personalityData = {
  resumen_global_personalidad: {
    Sinceridad: 88,
    Emocion: 45,
    Competencia: 92,
    Sofisticacion: 60,
    Rudeza: 12
  }
};

// Mock Data for Top Topics (Micro Cards & Gauge)
const topicsData = {
    results: {
        analisis_agregado: [
            { topic: 'Atención al Cliente', frecuencia_relativa: 88, sentimiento_promedio: 0.78 }, // Adjusted to hit 62 score
            { topic: 'Tiempos de Espera', frecuencia_relativa: 65, sentimiento_promedio: -0.42 },
            { topic: 'Calidad del Producto', frecuencia_relativa: 45, sentimiento_promedio: 0.15 },
            { topic: 'Precio', frecuencia_relativa: 30, sentimiento_promedio: 0.05 }, // Should be filtered out
            { topic: 'Ubicación', frecuencia_relativa: 12, sentimiento_promedio: 0.9 } // Should be filtered out
        ]
    }
};

// Mock Data for Narrative Frames
const narrativeData = {
    results: {
        analisis_agregado: {
            Positivo: 0.45,
            Negativo: 0.25,
            Aspiracional: 0.30
        },
        evolucion_temporal: [
            { semana: 1, marcos_distribucion: { Positivo: 0.30, Negativo: 0.40, Aspiracional: 0.30 } },
            { semana: 2, marcos_distribucion: { Positivo: 0.35, Negativo: 0.35, Aspiracional: 0.30 } },
            { semana: 3, marcos_distribucion: { Positivo: 0.40, Negativo: 0.30, Aspiracional: 0.30 } },
            { semana: 4, marcos_distribucion: { Positivo: 0.42, Negativo: 0.28, Aspiracional: 0.30 } },
            { semana: 5, marcos_distribucion: { Positivo: 0.45, Negativo: 0.25, Aspiracional: 0.30 } }
        ]
    }
};

// Mock Data for Influencer Ranking
const influencerData = {
    results: {
        influenciadores_globales: [
            { username: "@TechGuru99", autoridad_promedio: 92, afinidad_promedio: 85, menciones: 1450, score_centralidad: 0.95, sentimiento: 0.8, comentario_evidencia: "Nunca había visto una interfaz tan fluida, definitivamente cambia el juego." },
            { username: "@SaraVlogz", autoridad_promedio: 78, afinidad_promedio: 95, menciones: 890, score_centralidad: 0.88, sentimiento: 0.6, comentario_evidencia: "Me encanta como se siente, aunque la batería podría durar un poco más." },
            { username: "@Critic_One", autoridad_promedio: 88, afinidad_promedio: 40, menciones: 1200, score_centralidad: 0.82, sentimiento: -0.5, comentario_evidencia: "El precio es excesivo para lo que realmente ofrece en comparación con la competencia." },
            { username: "@DesignDaily", autoridad_promedio: 85, afinidad_promedio: 90, menciones: 650, score_centralidad: 0.75, sentimiento: 0.9, comentario_evidencia: "Estéticamente es una obra de arte, cada detalle está cuidado al milímetro." },
            { username: "@NewsFeed", autoridad_promedio: 95, afinidad_promedio: 50, menciones: 2100, score_centralidad: 0.70, sentimiento: 0.1, comentario_evidencia: "El lanzamiento ha generado opiniones mixtas en el mercado actual." },
            { username: "@RandomUser", autoridad_promedio: 20, afinidad_promedio: 30, menciones: 10, score_centralidad: 0.10, sentimiento: 0.0, comentario_evidencia: "Meh." }
        ]
    }
};

// Mock Data for Opportunities Matrix
const opportunitiesData = {
    results: {
        oportunidades: [
            { oportunidad: "Automatización de Soporte", gap_score: 85, competencia_score: 90, recomendacion_accion: "Implementar chatbot con IA para reducir tiempos de espera.", detalle: "Alta demanda de usuarios y alto impacto en costos." },
            { oportunidad: "Programa de Fidelización", gap_score: 75, competencia_score: 60, recomendacion_accion: "Crear niveles VIP para usuarios frecuentes.", detalle: "Usuarios piden recompensas recurrentes." },
            { oportunidad: "App Nativa iPad", gap_score: 30, competencia_score: 40, recomendacion_accion: "Evaluar viabilidad para Q4.", detalle: "Nicho pequeño pero vocal." },
            { oportunidad: "Integración CRM", gap_score: 65, competencia_score: 20, recomendacion_accion: "Prioridad media, buscar partners.", detalle: "Útil para B2B, bajo impacto en B2C." },
            { oportunidad: "Modo Oscuro", gap_score: 95, competencia_score: 95, recomendacion_accion: "Lanzar actualización ASAP.", detalle: "Feature #1 más solicitada y estándar de industria." },
            { oportunidad: "Soporte Multi-idioma", gap_score: 45, competencia_score: 80, recomendacion_accion: "Expandir a Portugués y Francés.", detalle: "Abre mercados pero demanda actual es moderada." }
        ]
    }
};

// Mock Data for Sentiment Bars
const sentimentData = {
    results: {
        analisis_agregado: {
            Positivo: 0.45,
            Negativo: 0.15,
            Neutral: 0.25,
            Mixto: 0.15,
            subjetividad_promedio_global: 0.72,
            ejemplo_mixto: "Me encanta el diseño y la velocidad, pero el precio me parece un poco elevado para las funcionalidades actuales."
        }
    }
};

// Mock Data for Temporal Evolution
const evolutionData = {
    results: {
        resumen_global: {
            tendencia: "Deterioro Detectado"
        },
        serie_temporal_semanal: [
            { fecha_semana: "Sem 1", porcentaje_positivo: 0.78, engagement: 1200, topico_principal: "Lanzamiento Beta" },
            { fecha_semana: "Sem 2", porcentaje_positivo: 0.75, engagement: 1500, topico_principal: "Feedback Inicial" },
            { fecha_semana: "Sem 3", porcentaje_positivo: 0.62, engagement: 2100, topico_principal: "Reporte de Bugs" },
            { fecha_semana: "Sem 4", porcentaje_positivo: 0.55, engagement: 1900, topico_principal: "Problemas Login" },
            { fecha_semana: "Sem 5", porcentaje_positivo: 0.42, engagement: 2800, topico_principal: "Indignación Redes" }
        ]
    }
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <main className="w-full p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
            
            {/* Header Lab Card */}
            <CardLabsHeader />

            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
                
                {/* 1. TOP TOPICS SECTION */}
                <div className="col-span-12 md:col-span-8">
                    <CardLabsQ3_TopTopics data={topicsData} />
                </div>

                {/* 2. CONCLUSION GAUGE */}
                <div className="col-span-12 md:col-span-4">
                    <CardLabsQ3_ConclusionGauge data={topicsData} />
                </div>

                {/* 3. Main Content Area (Left col-8) */}
                <div className="col-span-12 md:col-span-8 flex flex-col gap-6">
                    
                    {/* Radar Charts (Side by Side) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="h-[420px]">
                            <CardLabsQ1_Emotions data={emotionsData} />
                        </div>
                        <div className="h-[420px]">
                            <CardLabsQ2_Personality data={personalityData} />
                        </div>
                    </div>

                    {/* Opportunities Matrix - Reduced Height */}
                    <div className="h-[340px]">
                        <CardLabsQ6_OpportunitiesMatrix data={opportunitiesData} />
                    </div>
                    
                    {/* Temporal Evolution */}
                    <div className="h-[400px]">
                        <CardLabsQ8_TemporalEvolution data={evolutionData} />
                    </div>
                </div>

                {/* 4. Right Sidebar (Right col-4) */}
                <div className="col-span-12 md:col-span-4 flex flex-col gap-6">
                    
                    {/* Narrative Frames */}
                    <div className="h-auto">
                        <CardLabsQ4_NarrativeFrames data={narrativeData} />
                    </div>
                    
                    {/* Influencer Ranking */}
                    <div className="h-auto">
                        <CardLabsQ5_InfluencerRanking data={influencerData} />
                    </div>

                    {/* MOVED: Sentiment Bars (from Left Col) */}
                    <div className="h-[400px]">
                         <CardLabsQ7_SentimentBars data={sentimentData} />
                    </div>
                </div>

            </div>
        </div>
      </main>
    </div>
  );
};

export default App;