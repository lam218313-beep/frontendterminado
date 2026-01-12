/**
 * Mock Data for Brand Book
 * Used when user has no access to 'brand'
 */

export const MOCK_BRAND_DATA = {
    mvv_mision: "Transformar la manera en que las pequeñas empresas gestionan su presencia digital, haciéndola accesible y poderosa para todos.",
    mvv_vision: "Ser la plataforma líder mundial en automatización de branding para emprendedores en 2030.",
    mvv_valores: [
        { titulo: "Innovación", descripcion: "Buscamos constantemente nuevas formas de resolver problemas antiguos." },
        { titulo: "Simplicidad", descripcion: "Hacemos lo complejo, sencillo y comprensible." },
        { titulo: "Empatía", descripcion: "Diseñamos pensando siempre en el usuario final." }
    ],
    personalidad_arquetipo_nombre: "El Creador",
    personalidad_arquetipo_descripcion: "Impulsado por el deseo de crear cosas nuevas y duraderas. Valora la expresión, la imaginación y la cultura.",
    personalidad_tono_voz: "Inspirador, Visionario, Auténtico",
    paleta_colores: [
        { hex: "#6366F1", nombre: "Indigo Vibrante", uso: "Primario" },
        { hex: "#818CF8", nombre: "Indigo Suave", uso: "Secundario" },
        { hex: "#F43F5E", nombre: "Rosa Energético", uso: "Acento" },
        { hex: "#1F2937", nombre: "Gris Grafito", uso: "Texto" },
        { hex: "#F9FAFB", nombre: "Blanco Humo", uso: "Fondo" }
    ],
    tipometria_titulos: { fontFamily: "Montserrat", peso: "Bold", uso: "Títulos y Encabezados" },
    tipometria_cuerpos: { fontFamily: "Inter", peso: "Regular", uso: "Cuerpo de texto y UI" },
    // Mock URLs for images - pointing to placeholders or specific assets if available
    logo_base_url: "https://via.placeholder.com/300x100?text=LOGO+DEMO",
    logo_monocromo_url: "https://via.placeholder.com/300x100/000000/FFFFFF?text=LOGO+MONO",
    download_url: "#"
};
