import React from 'react';
import { CardLabsHeader } from './components/CardLabsHeader.tsx';
import { CardLabsQ1_Emotions } from './components/CardLabsQ1_Emotions.tsx';
import { CardLabsQ3_TopTopics } from './components/CardLabsQ3_TopTopics.tsx';
import { CardLabsQ6_OpportunitiesMatrix } from './components/CardLabsQ6_OpportunitiesMatrix.tsx';
import { CardLabsQ7_SentimentBars } from './components/CardLabsQ7_SentimentBars.tsx';
import { CardLabsQ8_TemporalEvolution } from './components/CardLabsQ8_TemporalEvolution.tsx';
import { CardLabsQ9_Prioritization } from './components/CardLabsQ9_Prioritization.tsx';
import { CardLabsQ10_ExecutiveSummary } from './components/CardLabsQ10_ExecutiveSummary.tsx';

// --- MOCK DATA ---
const MOCK_DATA = {
  q1: { // Spider Graph
    emociones: [
      { name: 'Alegría', value: 65 },
      { name: 'Confianza', value: 80 },
      { name: 'Miedo', value: 20 },
      { name: 'Sorpresa', value: 45 },
      { name: 'Tristeza', value: 15 },
      { name: 'Aversión', value: 10 },
      { name: 'Ira', value: 25 },
      { name: 'Anticipación', value: 70 },
    ]
  },
  q3: { // 3 Rings (Modified to 2 for 8-card grid balance)
    results: {
      analisis_agregado: [
        { topic: 'Atención', frecuencia_relativa: 85, sentimiento_promedio: 0.6 },
        { topic: 'Precio', frecuencia_relativa: 65, sentimiento_promedio: -0.2 },
        // { topic: 'Calidad', frecuencia_relativa: 45, sentimiento_promedio: 0.8 }, // Removed to keep grid at 8 cards perfectly
      ]
    }
  },
  q6: { // Quadrants
    results: {
      oportunidades: [
        { oportunidad: 'UI Móvil', gap_score: 85, competencia_score: 60, recomendacion_accion: 'Mejorar', detalle: '' },
        { oportunidad: 'App Nativa', gap_score: 92, competencia_score: 40, recomendacion_accion: 'Crear', detalle: '' },
        { oportunidad: 'Soporte', gap_score: 45, competencia_score: 80, recomendacion_accion: 'Mantener', detalle: '' },
        { oportunidad: 'Freemium', gap_score: 30, competencia_score: 30, recomendacion_accion: 'Descartar', detalle: '' },
        { oportunidad: 'API', gap_score: 75, competencia_score: 55, recomendacion_accion: 'Vender', detalle: '' },
      ]
    }
  },
  q7: { // Bar Chart
    results: {
      analisis_agregado: {
        Positivo: 0.45,
        Negativo: 0.15,
        Neutral: 0.25,
        Mixto: 0.15,
        subjetividad_promedio_global: 0.68,
        ejemplo_mixto: "El servicio es rápido pero la app se cuelga."
      }
    }
  },
  q8: { // Time Graph
    results: {
      serie_temporal_semanal: [
        { fecha_semana: 'W1', porcentaje_positivo: 40, engagement: 1200, topico_principal: 'Launch' },
        { fecha_semana: 'W2', porcentaje_positivo: 45, engagement: 1500, topico_principal: 'Features' },
        { fecha_semana: 'W3', porcentaje_positivo: 42, engagement: 1350, topico_principal: 'Bugs' },
        { fecha_semana: 'W4', porcentaje_positivo: 55, engagement: 2100, topico_principal: 'Update' },
        { fecha_semana: 'W5', porcentaje_positivo: 60, engagement: 2400, topico_principal: 'Reviews' },
      ],
      resumen_global: { tendencia: 'Crecimiento' }
    }
  },
  q9: { // Prioritization Matrix
    lista_recomendaciones: [
      { recomendacion: "Optimizar Onboarding", descripcion: "Reducir fricción en registro aumenta conversión un 15%.", area_estrategica: "Producto", score_impacto: 90, score_esfuerzo: 20, prioridad: 4.5, urgencia: 'CRÍTICA' as const },
      { recomendacion: "Campaña Retargeting", descripcion: "Usuarios inactivos responden bien a descuentos.", area_estrategica: "Marketing", score_impacto: 80, score_esfuerzo: 40, prioridad: 2, urgencia: 'ALTA' as const },
      { recomendacion: "Rediseño Logo", descripcion: "Modernizar imagen corporativa.", area_estrategica: "Branding", score_impacto: 30, score_esfuerzo: 80, prioridad: 0.3, urgencia: 'BAJA' as const },
      { recomendacion: "Soporte Chatbot", descripcion: "Automatizar respuestas nivel 1.", area_estrategica: "Operaciones", score_impacto: 75, score_esfuerzo: 60, prioridad: 1.2, urgencia: 'MEDIA' as const },
      { recomendacion: "Blog Corporativo", descripcion: "Mejorar SEO a largo plazo.", area_estrategica: "Marketing", score_impacto: 60, score_esfuerzo: 50, prioridad: 1.2, urgencia: 'MEDIA' as const },
    ],
    insight: "El área de Producto presenta las mayores oportunidades de bajo esfuerzo (Quick Wins)."
  },
  q10: { // Executive Summary
    alerta_prioritaria: "Caída del 15% en sentimiento positivo en segmento 'Nuevos Usuarios' debido a error en verificación SMS.",
    hallazgos_clave: [],
    kpis_principales: {
      emocion_dominante: "Anticipación",
      emocion_porcentaje: 42,
      personalidad_marca: "Sinceridad",
      sentimiento_positivo_pct: 58,
      tendencia_temporal: 'Estable' as const,
      recomendaciones_criticas: 3
    },
    urgencias_por_prioridad: {
      '48_horas': ["Rollback de verificación SMS", "Comunicado a usuarios afectados"],
      'semana_1': ["Revisar proveedor de SMS", "Implementar alternativa WhatsApp"],
      'semanas_2_3': ["Auditoría de UX en registro", "Campaña de recuperación"]
    }
  }
};

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg font-sans">
      <main className="w-full p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
            
            <CardLabsHeader />

            {/* Grid Layout for exactly 8 Cards (4 double-width, 4 single-width) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* 1. Q10 Executive Summary (Double) */}
                <div className="lg:col-span-2 md:col-span-2">
                    <CardLabsQ10_ExecutiveSummary data={MOCK_DATA.q10} />
                </div>

                {/* 2. Q9 Prioritization Matrix (Double) */}
                <div className="lg:col-span-2 md:col-span-2">
                   <CardLabsQ9_Prioritization data={MOCK_DATA.q9} />
                </div>

                {/* 3. Q8 Time Evolution (Double) */}
                <div className="lg:col-span-2 md:col-span-2">
                    <CardLabsQ8_TemporalEvolution data={MOCK_DATA.q8} />
                </div>

                {/* 4. Q6 Opportunity Matrix (Double) */}
                <div className="lg:col-span-2 md:col-span-2">
                    <CardLabsQ6_OpportunitiesMatrix data={MOCK_DATA.q6} />
                </div>

                {/* 5. Q1 Spider Graph (Single) */}
                <div className="lg:col-span-1">
                    <CardLabsQ1_Emotions data={MOCK_DATA.q1} />
                </div>
                
                {/* 6. Q7 Bar Chart (Single) */}
                <div className="lg:col-span-1">
                    <CardLabsQ7_SentimentBars data={MOCK_DATA.q7} />
                </div>

                 {/* 7 & 8. Q3 Top Topics (Renders 2 Single Cards) 
                    Note: The Q3 component iterates over the data. 
                    We limited mock data to 2 items to produce exactly 2 cards here.
                 */}
                 <div className="lg:col-span-2 md:col-span-2">
                    <div className="w-full">
                         <CardLabsQ3_TopTopics data={MOCK_DATA.q3} />
                    </div>
                 </div>

            </div>
        </div>
      </main>
    </div>
  );
};

export default App;