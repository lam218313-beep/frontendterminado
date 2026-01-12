/**
 * Mock Data for Strategy Map
 * Used when user has no access to 'estrategia'
 */

export const MOCK_STRATEGY_DATA = {
    // Initial nodes for the graph to not be empty
    initialNodes: [
        {
            id: "demo-main-1",
            type: "main",
            label: "Dominar Mercado Local",
            description: "Objetivo principal para Q3 2024",
            parentId: null,
            x: 0,
            y: 0
        },
        {
            id: "demo-sec-1",
            type: "secondary",
            label: "SEO Local",
            description: "Optimizar GMB y keywords locales",
            parentId: "demo-main-1",
            x: 240,
            y: 0
        },
        {
            id: "demo-post-1",
            type: "post",
            label: "Post: Guía de Barrio",
            description: "Carrousel con los mejores sitios",
            parentId: "demo-sec-1",
            x: 420,
            y: 0
        }
    ],

    // Recommendations that appear in the sidebar
    recommendations: [
        {
            titulo: "Lanzar Programa de Referidos",
            descripcion: "Incentivar a clientes actuales a traer nuevos leads con descuentos dobles.",
            prioridad: "Alta",
            area: "Crecimiento",
            impacto: "9"
        },
        {
            titulo: "Webinar Educativo Mensual",
            descripcion: "Posicionarse como autoridad mediante clases gratuitas en vivo.",
            prioridad: "Media",
            area: "Marca",
            impacto: "8"
        },
        {
            titulo: "Automatizar Email Welcome",
            descripcion: "Crear secuencia de bienvenida para nuevos suscriptores.",
            prioridad: "Alta",
            area: "Retención",
            impacto: "7"
        },
        {
            titulo: "Colaboración con Micro-Influencers",
            descripcion: "Buscar 5 influencers de nicho para campaña de awareness.",
            prioridad: "Media",
            area: "Alcance",
            impacto: "8"
        }
    ]
};
