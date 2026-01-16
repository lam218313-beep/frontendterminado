import React from 'react';
import {
    Target,
    MessageCircle,
    PenTool,
    Type,
    Palette,
    Grid,
    Box,
    Layers,
    Smartphone,
    Eye,
    Heart,
    Zap
} from 'lucide-react';

// --- Interfaces ---
export interface BrandIdentityData {
    mission?: string;
    vision?: string;
    values?: Array<{ title: string; desc: string }>;
    tone_traits?: Array<{ trait: string; desc: string }>;
    colors?: {
        primary?: string;
        secondary?: string;
        background?: string;
    };
    archetype?: string;
    typography?: any;
    logo_url?: string;
    stationery_url?: string;
    brand_name?: string;
    personas?: {
        ideal: any;
        anti: any;
    };
}

interface CommonProps {
    data?: BrandIdentityData;
}

// --- CARD 2: MISSION & VISION ---
export const CardMission: React.FC<CommonProps> = ({ data }) => {
    const mission = data?.mission || "Democratizar el acceso a tecnologías regenerativas avanzadas, simplificando lo complejo para mejorar la vida cotidiana.";
    const vision = data?.vision || "Ser el estándar global en biotecnología de consumo para el año 2030, liderando con ética e innovación.";
    const primary = data?.colors?.primary || "#F20F79";

    return (
        <div className="h-full bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-bl-[100px] -z-0 transition-transform duration-700 group-hover:scale-110" style={{ backgroundColor: `${primary}15` }}></div>

            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg" style={{ backgroundColor: `${primary}20`, color: primary }}>
                        <Target size={20} />
                    </div>
                    <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Identidad Verbal</span>
                </div>

                <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-[0.9] mb-8">
                    {data?.archetype ? `Arquetipo: ${data.archetype}` : (
                        <>
                            Redefiniendo la <br />
                            <span style={{ color: primary }}>experiencia humana</span> <br />
                            a través de la ciencia.
                        </>
                    )}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-auto">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Misión</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">
                            {mission}
                        </p>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Visión</h3>
                        <p className="text-gray-500 leading-relaxed text-sm">
                            {vision}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CARD 3: PERSONALITY & TONE ---
export const CardTone: React.FC<CommonProps> = ({ data }) => {
    const traits = data?.tone_traits || [
        { trait: "Empático", desc: "Cercano pero no invasivo. Entendemos el dolor del usuario." },
        { trait: "Clínico", desc: "Preciso. Sin ambigüedades. Basado en datos." },
        { trait: "Visionario", desc: "Inspirador. Siempre mirando hacia el futuro." }
    ];

    return (
        <div className="h-full bg-brand-dark rounded-[40px] p-8 md:p-10 shadow-lg text-white flex flex-col relative overflow-hidden group">
            {/* Abstract Pattern */}
            <div className="absolute -right-10 -bottom-10 w-40 h-40 border-[20px] border-white/5 rounded-full"></div>
            <div className="absolute -left-10 top-20 w-20 h-20 bg-primary-500/20 rounded-full blur-2xl"></div>

            <div className="flex items-center gap-3 mb-8 relative z-10">
                <div className="p-2 bg-white/10 rounded-lg">
                    <MessageCircle size={20} />
                </div>
                <span className="text-sm font-bold text-white/60 uppercase tracking-widest">Tono de Voz</span>
            </div>

            <div className="space-y-6 flex-1 relative z-10">
                {traits.map((t, i) => (
                    <div key={i} className="group/item cursor-default">
                        <h3 className="text-2xl font-bold mb-1 group-hover/item:text-primary-400 transition-colors">{t.trait}</h3>
                        <p className="text-sm text-gray-300">{t.desc}</p>
                        {i < traits.length - 1 && <div className="w-full h-px bg-white/10 mt-6"></div>}
                    </div>
                ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
                <p className="text-xs text-white/50 uppercase font-bold mb-2">Elevator Pitch</p>
                <p className="text-sm italic text-white/80">"Regenetix no es solo salud, es la evolución consciente de tu bienestar biológico."</p>
            </div>
        </div>
    );
};

// --- CARD 4: LOGO CONCEPT ---
export const CardLogo: React.FC<CommonProps> = ({ data }) => {
    return (
        <div className="h-full bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex flex-col relative group overflow-hidden">
            <div className="relative z-10 flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-700"><PenTool size={18} /></div>
                    <span className="text-sm font-bold text-gray-500 uppercase">Logotipo (Concepto)</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center">
                <h1
                    className="text-6xl md:text-7xl font-bold tracking-tight mb-2 transition-all duration-300 group-hover:tracking-wide"
                    style={{
                        color: data?.colors?.primary || '#333',
                        fontFamily: data?.typography?.heading || 'sans-serif'
                    }}
                >
                    {data?.brand_name || "Brand"}
                </h1>
                <p className="text-sm text-gray-400 font-medium mt-4">
                    Visualización conceptual basada en tipografía <span className="text-gray-600 font-bold">{data?.typography?.heading || 'Principal'}</span>
                </p>

                <div className="mt-8 flex gap-4 text-xs text-gray-400 border-t border-gray-100 pt-6 w-full justify-center">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <span>Legibilidad Alta</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        <span>Versátil</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CARD 5: COLOR PALETTE ---
export const CardColors: React.FC<CommonProps> = ({ data }) => {
    const primary = data?.colors?.primary || "#F20F79";
    const secondary = data?.colors?.secondary || "#465362";
    const bg = data?.colors?.background || "#F4F7FE";

    return (
        <div className="h-full bg-white rounded-[40px] shadow-sm border border-gray-100 flex flex-col overflow-hidden">

            <div className="p-8 pb-0">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-700"><Palette size={18} /></div>
                    <span className="text-sm font-bold text-gray-500 uppercase">Cromatismo</span>
                </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row">
                {/* Primary */}
                <div className="flex-1 p-6 flex flex-col justify-between text-white group hover:flex-[1.5] transition-all duration-500" style={{ backgroundColor: primary }}>
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold opacity-60 uppercase">Primario</span>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold mb-1">Brand Color</h4>
                        <p className="font-mono text-xs opacity-80">{primary}</p>
                    </div>
                </div>

                {/* Secondary */}
                <div className="flex-1 p-6 flex flex-col justify-between text-white group hover:flex-[1.5] transition-all duration-500" style={{ backgroundColor: secondary }}>
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold opacity-60 uppercase">Base</span>
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold mb-1">Accent</h4>
                        <p className="font-mono text-xs opacity-80">{secondary}</p>
                    </div>
                </div>

                {/* Background */}
                <div className="flex-1 p-6 flex flex-col justify-between text-brand-dark group hover:flex-[1.5] transition-all duration-500" style={{ backgroundColor: bg }}>
                    <div className="flex justify-between items-start">
                        <span className="text-xs font-bold opacity-60 uppercase">Fondo</span>
                        <div className="w-2 h-2 bg-brand-dark rounded-full"></div>
                    </div>
                    <div>
                        <h4 className="text-2xl font-bold mb-1">Surface</h4>
                        <p className="font-mono text-xs opacity-60">{bg}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CARD 6: TYPOGRAPHY ---
export const CardTypography: React.FC<CommonProps> = ({ data }) => {
    const primary = data?.colors?.primary || "#F20F79";
    const headingFont = data?.typography?.heading || "Montserrat";
    const bodyFont = data?.typography?.body || "Inter";

    return (
        <div className="h-full bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10">

            {/* Left: Specimen */}
            <div className="w-full md:w-1/3 flex flex-col items-center justify-center border-r border-gray-100 pr-0 md:pr-10">
                <span
                    className="text-[100px] lg:text-[120px] leading-none font-bold text-transparent bg-clip-text bg-gradient-to-br from-gray-900 to-gray-400"
                    style={{ fontFamily: headingFont }}
                >
                    Aa
                </span>
                <div className="mt-4 text-center">
                    <h3 className="text-xl font-bold text-gray-900" style={{ fontFamily: headingFont }}>{headingFont}</h3>
                    <p className="text-xs text-gray-400">Heading & Display</p>
                </div>
            </div>

            {/* Right: Usage */}
            <div className="w-full md:w-2/3 space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-700"><Type size={18} /></div>
                    <span className="text-sm font-bold text-gray-500 uppercase">Jerarquía Tipográfica</span>
                </div>

                <div>
                    <span className="text-xs font-bold uppercase mb-1 block" style={{ color: primary }}>Display / H1</span>
                    <p className="text-4xl font-extrabold text-gray-900 tracking-tight" style={{ fontFamily: headingFont }}>The Quick Brown Fox</p>
                </div>
                <div>
                    <span className="text-xs font-bold uppercase mb-1 block" style={{ color: primary }}>Heading / H2</span>
                    <p className="text-2xl font-semibold text-gray-900" style={{ fontFamily: headingFont }}>Jumps over the lazy dog.</p>
                </div>
                <div>
                    <span className="text-xs text-gray-400 font-bold uppercase mb-1 block">Body / P</span>
                    <p className="text-sm text-gray-500 leading-relaxed max-w-md" style={{ fontFamily: bodyFont }}>
                        {bodyFont} es una tipografía diseñada específicamente para pantallas de ordenador. Cuenta con una gran altura de la x para mejorar la legibilidad en tamaños pequeños.
                    </p>
                </div>
            </div>
        </div>
    );
};

// --- CARD 7: ICONOGRAPHY ---
export const CardIconography: React.FC<CommonProps> = ({ data }) => {
    const primary = data?.colors?.primary || "#F20F79";

    return (
        <div className="h-full rounded-[40px] p-8 shadow-sm flex flex-col relative overflow-hidden" style={{ backgroundColor: `${primary}10` }}>

            <div className="relative z-10 flex justify-between items-start mb-6">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-white rounded-lg" style={{ color: primary }}><Grid size={18} /></div>
                    <span className="text-sm font-bold uppercase" style={{ color: `${primary}90` }}>Iconografía</span>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 flex-1 content-center relative z-10">
                {[Heart, Zap, Eye, Box, Layers, Target].map((Icon, idx) => (
                    <div key={idx} className="aspect-square bg-white rounded-2xl flex items-center justify-center shadow-sm hover:scale-110 transition-transform cursor-pointer" style={{ color: primary }}>
                        <Icon strokeWidth={2} size={24} />
                    </div>
                ))}
            </div>

            <p className="relative z-10 mt-6 text-xs text-center font-medium" style={{ color: `${primary}99` }}>
                Estilo lineal, stroke 2px, esquinas redondeadas.
            </p>

            {/* Background decoration */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none"
                style={{ background: `linear-gradient(to top, ${primary}20, transparent)` }}
            ></div>
        </div>
    );
};

// --- CARD 8: VISUAL UNIVERSE ---
export const CardPatterns: React.FC<CommonProps> = ({ data }) => {
    const primary = data?.colors?.primary || "#F20F79";

    return (
        <div className="h-full bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100 relative group p-8 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-700"><Layers size={18} /></div>
                <span className="text-sm font-bold text-gray-500 uppercase">Universo Visual</span>
            </div>

            <div className="flex-1 space-y-4">
                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <h4 className="font-bold text-gray-900 text-sm mb-2">Fotografía</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">
                        Se recomienda el uso de iluminación natural, encuadres abiertos y sujetos en acción. Evitar poses estáticas o iluminación de estudio excesiva.
                    </p>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <h4 className="font-bold text-gray-900 text-sm mb-2">Composición</h4>
                    <div className="flex gap-2">
                        <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-gray-600 border border-gray-200">Simétrica</span>
                        <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-gray-600 border border-gray-200">Espacio Negativo</span>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-4">
                <div className="h-1 w-full rounded-full" style={{ background: `linear-gradient(to right, ${primary}, #e5e7eb)` }}></div>
            </div>
        </div>
    );
};

// --- CARD 9: BRAND APPLICATIONS ---
export const CardStationery: React.FC<CommonProps> = ({ data }) => {
    const primary = data?.colors?.primary || "#F20F79";

    return (
        <div className="h-full bg-gray-50 rounded-[40px] p-8 relative overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 bg-white rounded-lg text-gray-900 shadow-sm"><Box size={18} /></div>
                <span className="text-sm font-bold text-gray-400 uppercase">Aplicaciones Sugeridas</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
                {[
                    { title: "Digital", items: ["Firma de Email", "Favicon", "Post Plantilla", "Banner Web"] },
                    { title: "Impreso", items: ["Tarjeta de Visita", "Membrete", "Carpeta Corporativa", "Merchandising"] }
                ].map((category, idx) => (
                    <div key={idx} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                            {idx === 0 ? <Smartphone size={16} style={{ color: primary }} /> : <Layers size={16} style={{ color: primary }} />}
                            {category.title}
                        </h4>
                        <ul className="space-y-2">
                            {category.items.map((item, i) => (
                                <li key={i} className="text-sm text-gray-500 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-gray-200"></div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </div>

            <div className="mt-6 bg-white/50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500 italic">
                    "La consistencia en estos puntos de contacto construye la confianza de la marca {data?.brand_name}."
                </p>
            </div>
        </div>
    );
};

// --- CARD 10: VALUES ---
export const CardValues: React.FC<CommonProps> = ({ data }) => {
    const primary = data?.colors?.primary || "#F20F79";
    const values = data?.values || [
        { title: "Innovación Ética", desc: "Avanzar sin romper." },
        { title: "Transparencia Radical", desc: "Datos abiertos al usuario." },
        { title: "Diseño Humano", desc: "Tecnología que se siente natural." }
    ];

    return (
        <div className="h-full bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex flex-col">
            <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${primary}15`, color: primary }}>
                    <Smartphone size={18} />
                </div>
                <span className="text-sm font-bold text-gray-500 uppercase">Valores Centrales</span>
            </div>

            <div className="flex-1 space-y-3">
                {values.map((val, i) => (
                    <div key={i} className="group cursor-pointer">
                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">{val.title}</h4>
                                <p className="text-xs text-gray-500">{val.desc}</p>
                            </div>
                            <div className="w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: primary }}></div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-4 bg-gray-900 rounded-2xl text-center">
                <span className="text-xs text-white font-bold">#FutureOfRegeneration</span>
            </div>
        </div>
    );
};