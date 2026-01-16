/**
 * Mock Data for Brand Book
 * Used when user has no access to 'brand'
 */

export const MOCK_BRAND_DATA = {
    mission: "Transformar la manera en que las pequeñas empresas gestionan su presencia digital, haciéndola accesible y poderosa para todos.",
    vision: "Ser la plataforma líder mundial en automatización de branding para emprendedores en 2030.",
    values: [
        { title: "Innovación", desc: "Buscamos constantemente nuevas formas de resolver problemas antiguos." },
        { title: "Simplicidad", desc: "Hacemos lo complejo, sencillo y comprensible." },
        { title: "Empatía", desc: "Diseñamos pensando siempre en el usuario final." }
    ],
    archetype: "El Creador",
    tone_traits: [
        { trait: "Inspirador", desc: "Motivamos a la acción y al cambio positivo." },
        { trait: "Visionario", desc: "Vemos más allá del presente." },
        { trait: "Auténtico", desc: "Hablamos con verdad y transparencia." }
    ],
    colors: {
        primary: "#6366F1",
        secondary: "#818CF8",
        background: "#F9FAFB"
    },
    typography: {
        heading: "Montserrat",
        body: "Inter"
    },
    // Mock URLs for images - pointing to placeholders or specific assets if available
    logo_url: "https://via.placeholder.com/300x100?text=LOGO+DEMO",
    stationery_url: "https://via.placeholder.com/600x400/E5E9F2/333333?text=STATIONERY+MOCK",
    download_url: "#",
    brand_name: "BrandDemo"
};
