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
            label: "Proyecto: Demo Marketing",
            description: "Estrategia General",
            parentId: null,
            x: 0,
            y: 0
        },
        {
            id: "demo-sec-1",
            type: "secondary",
            label: "Objetivo: Crecimiento de Marca",
            description: "Aumentar visibilidad en redes",
            parentId: "demo-main-1",
            x: 280,
            y: -50
        },
        {
            id: "demo-sec-2",
            type: "secondary",
            label: "Objetivo: Aumento de Ventas",
            description: "Convertir seguidores en clientes",
            parentId: "demo-main-1",
            x: 280,
            y: 50
        },
        {
            id: "demo-post-1",
            type: "concept",
            label: "Concepto: Guía de Estilo",
            description: "Carrousel con tips de moda",
            parentId: "demo-sec-1",
            x: 520, // Increased spacing
            y: -80
        },
        {
            id: "demo-post-2",
            type: "concept",
            label: "Concepto: Testimonios",
            description: "Video de cliente satisfecho",
            parentId: "demo-sec-1",
            x: 520,
            y: -20
        },
        {
            id: "demo-post-3",
            type: "concept",
            label: "Concepto: Oferta Flash",
            description: "Story con link de compra",
            parentId: "demo-sec-2",
            x: 520,
            y: 50
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
