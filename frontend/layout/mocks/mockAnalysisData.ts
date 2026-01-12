/**
 * Mock Data for Lab Analysis (Q1-Q10)
 * Used when user has no access to 'analisis_completo'
 */

import { Q1Response, Q2Response, Q3Response, Q4Response, Q5Response, Q6Response, Q7Response, Q8Response, Q9Response, Q10Response } from '../services/api';

export const MOCK_ANALYSIS_DATA = {
    Q1: {
        emociones: [
            { name: "Alegría", value: 35 },
            { name: "Confianza", value: 25 },
            { name: "Anticipación", value: 15 },
            { name: "Sorpresa", value: 10 },
            { name: "Miedo", value: 5 },
            { name: "Tristeza", value: 5 },
            { name: "Ira", value: 3 },
            { name: "Aversión", value: 2 }
        ]
    } as Q1Response,

    Q2: {
        resumen_global_personalidad: {
            "Sinceridad": 85,
            "Emocion": 70,
            "Competencia": 60,
            "Sofisticacion": 40,
            "Rudeza": 10
        }
    } as Q2Response,

    Q3: {
        results: {
            analisis_agregado: [
                { topic: "Innovación", frecuencia_relativa: 0.85, sentimiento_promedio: 0.9, palabras_clave: ["nuevo", "futuro"] },
                { topic: "Sostenibilidad", frecuencia_relativa: 0.75, sentimiento_promedio: 0.8, palabras_clave: ["eco", "verde"] },
                { topic: "Precio", frecuencia_relativa: 0.60, sentimiento_promedio: 0.5, palabras_clave: ["costo", "oferta"] },
                { topic: "Servicio", frecuencia_relativa: 0.95, sentimiento_promedio: 0.95, palabras_clave: ["atención", "rápido"] },
                { topic: "Calidad", frecuencia_relativa: 0.88, sentimiento_promedio: 0.92, palabras_clave: ["bueno", "premium"] }
            ]
        }
    } as Q3Response,

    Q4: {
        results: {
            "analisis_agregado": {
                "Positivo": 65,
                "Negativo": 10,
                "Aspiracional": 25
            },
            "evolucion_temporal": [
                { semana: 1, marcos_distribucion: { Positivo: 50, Negativo: 15, Aspiracional: 35 } },
                { semana: 2, marcos_distribucion: { Positivo: 55, Negativo: 12, Aspiracional: 33 } },
                { semana: 3, marcos_distribucion: { Positivo: 65, Negativo: 10, Aspiracional: 25 } }
            ]
        }
    } as Q4Response,

    Q5: {
        results: {
            "influenciadores_globales": [
                { username: "@tech_guru", autoridad_promedio: 95, afinidad_promedio: 90, menciones: 150, score_centralidad: 0.8, sentimiento: 0.9, comentario_evidencia: "Promotor activo." },
                { username: "@eco_lifestyle", autoridad_promedio: 88, afinidad_promedio: 85, menciones: 80, score_centralidad: 0.7, sentimiento: 0.85, comentario_evidencia: "Menciona sostenibilidad." },
                { username: "@innovation_daily", autoridad_promedio: 82, afinidad_promedio: 75, menciones: 200, score_centralidad: 0.9, sentimiento: 0.7, comentario_evidencia: "Neutral pero influyente." }
            ]
        }
    } as Q5Response,

    Q6: {
        results: {
            "oportunidades": [
                { oportunidad: "Tendencia Eco-Friendly", gap_score: 90, competencia_score: 40, recomendacion_accion: "Lanzar línea verde.", detalle: "Alta demanda." },
                { oportunidad: "Colaboración Tech", gap_score: 75, competencia_score: 50, recomendacion_accion: "Partner con startups.", detalle: "Sinergia posible." },
                { oportunidad: "Expansión Digital", gap_score: 85, competencia_score: 30, recomendacion_accion: "TikTok Ads.", detalle: "Poca competencia." }
            ]
        }
    } as Q6Response,

    Q7: {
        results: {
            "analisis_agregado": {
                "Positivo": 60,
                "Negativo": 5,
                "Neutral": 20,
                "Mixto": 15,
                "subjetividad_promedio_global": 0.45,
                "ejemplo_mixto": "Buen producto pero entrega lenta."
            }
        }
    } as Q7Response,

    Q8: {
        results: {
            "serie_temporal_semanal": [
                { fecha_semana: "Semana 1", porcentaje_positivo: 45, engagement: 200, topico_principal: "Lanzamiento" },
                { fecha_semana: "Semana 2", porcentaje_positivo: 52, engagement: 350, topico_principal: "Reviews" },
                { fecha_semana: "Semana 3", porcentaje_positivo: 48, engagement: 180, topico_principal: "Soporte" },
                { fecha_semana: "Semana 4", porcentaje_positivo: 65, engagement: 400, topico_principal: "Viral" }
            ],
            "resumen_global": { "tendencia": "Alcista moderada" }
        }
    } as Q8Response,

    Q9: {
        results: {
            "lista_recomendaciones": [
                { "recomendacion": "Lanzar campaña de valores", "descripcion": "Enfatizar la sostenibilidad en el próximo trimestre.", "urgencia": "Alta", "area_estrategica": "Marca", "score_impacto": 9, "score_esfuerzo": 5, "prioridad": 1 },
                { "recomendacion": "Optimizar respuesta en RRSS", "descripcion": "Reducir tiempo de respuesta a menos de 2h.", "urgencia": "Media", "area_estrategica": "Soporte", "score_impacto": 7, "score_esfuerzo": 3, "prioridad": 2 },
                { "recomendacion": "Explorar formato Reels", "descripcion": "Crear contenido educativo corto.", "urgencia": "Baja", "area_estrategica": "Contenido", "score_impacto": 6, "score_esfuerzo": 4, "prioridad": 3 }
            ],
            "insight": "La marca tiene una percepción sólida pero le falta dinamismo en video corto.",
            "resumen_global": { "recomendaciones_criticas": 1, "areas_prioritarias": ["Marca", "Contenido"] }
        }
    } as Q9Response,

    Q10: {
        results: {
            "alerta_prioritaria": "Incremento de menciones sobre packaging",
            "hallazgos_clave": ["Packaging valorado", "Envíos lentos detectados"],
            "resumen_general": "Desempeño general positivo con áreas de mejora logística.",
            "kpis_principales": {
                "emocion_dominante": "Alegría",
                "emocion_porcentaje": 35,
                "personalidad_marca": "Sinceridad",
                "tema_principal": "Innovación",
                "sentimiento_positivo_pct": 65,
                "sentimiento_negativo_pct": 10,
                "tendencia_temporal": "Creciente",
                "anomalias_detectadas": 0,
                "recomendaciones_criticas": 1
            },
            "urgencias_por_prioridad": {
                "48_horas": ["Revisar proveedor logístico"],
                "semana_1": ["Planificar contenido Q2"],
                "semanas_2_3": ["Auditoria SEO"],
                "no_urgente": ["Rediseño de footer"]
            }
        }
    } as Q10Response
};
