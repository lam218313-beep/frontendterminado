import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, VolumeX, ChevronRight, ChevronLeft, SkipForward, X } from 'lucide-react';
import { BackgroundDashboard } from './BackgroundDashboard';
import { CenterTextPanel } from './CenterTextPanel';

//  --- SLIDES DATA ---
interface SlideContent {
    id: number;
    title: string;
    subtitle?: string;
    narration: string;
}

const slides: SlideContent[] = [
    {
        id: 0,
        title: "¡Bienvenido a Pixely Partners!",
        subtitle: "EMPIEZA TU VIAJE",
        narration: "Bienvenido a Pixely Partners. Soy tu asistente y estoy aquí para mostrarte cómo nuestra metodología transformará tu estrategia de marketing digital.",
    },
    {
        id: 1,
        title: "¿Qué es Pixely Partners?",
        subtitle: "UNA ALIANZA ESTRATÉGICA",
        narration: "Pixely Partners es una alianza bilateral. Nuestra tecnología diagnóstica procesa información de mercado para validar tu marca y minimizar la incertidumbre en cada decisión.",
    },
    {
        id: 2,
        title: "Nuestra Metodología",
        subtitle: "6 PASOS CLAVE",
        narration: "Te guiaremos a través de seis etapas: Entrevista, Manual de Marca, Análisis de Mercado, Estrategia Digital, Planificación de Contenido, y Beneficios Continuos.",
    },
    {
        id: 3,
        title: "Paso 1: Entrevista Inicial",
        subtitle: "CONOCE TU MARCA",
        narration: "Comenzamos conociendo tu negocio: nombre, industria, objetivos y valores. Esta información alimenta nuestro sistema de diagnóstico para generar insights personalizados.",
    },
    {
        id: 4,
        title: "Paso 2: Análisis de Datos",
        subtitle: "INTELIGENCIA DE DATOS",
        narration: "Analizamos patrones de mercado y redes sociales. Identificamos las emociones de tu audiencia y oportunidades ocultas utilizando modelos estadísticos avanzados.",
    },
    {
        id: 5,
        title: "Paso 3: Arquitectura de Marca",
        subtitle: "ECOSISTEMA DIGITAL",
        narration: "Visualizamos cómo tu marca se relaciona con clientes, competidores y canales. Identificamos puntos de contacto clave y oportunidades de diferenciación.",
    },
    {
        id: 6,
        title: "Paso 4: Plan de Contenido",
        subtitle: "CALENDARIO ESTRATÉGICO",
        narration: "Creamos un calendario editorial personalizado. Cada publicación está optimizada para maximizar engagement y conversión basándose en datos reales.",
    },
    {
        id: 7,
        title: "Paso 5: Validación y Aprobación",
        subtitle: "CONTROL DE CALIDAD",
        narration: "Revisas y aprovechas cada pieza de contenido antes de publicar. Tú tienes el control final sobre lo que se publica en nombre de tu marca.",
    },
    {
        id: 8,
        title: "Paso 6: Beneficios Continuos",
        subtitle: "VALOR A LARGO PLAZO",
        narration: "Accede a herramientas potenciadas por IA: generación de copy, análisis de tendencias, estudios de competencia, reportes automáticos y más.",
    },
    {
        id: 9,
        title: "Colaboración en Equipo",
        subtitle: "TRABAJA UNIDO",
        narration: "Invita a tu equipo a colaborar. Todos pueden ver el progreso, asignar tareas y mantener la coherencia de marca en un solo lugar.",
    },
    {
        id: 10,
        title: "¡Listo para Comenzar!",
        subtitle: "TU ESTRATEGIA ESPERA",
        narration: "Tu plataforma de inteligencia de mercado está configurada. Comienza ahora a transformar tu presencia digital con decisiones basadas en datos.",
    },
];

// --- MAIN COMPONENT ---

interface PixelyTutorialProps {
    onClose?: () => void;
}

export const PixelyTutorial: React.FC<PixelyTutorialProps> = ({ onClose }) => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Fetch TTS audio for current slide
    useEffect(() => {
        if (!isPlaying) return;

        const fetchAudio = async () => {
            try {
                const response = await fetch('http://localhost:8000/tts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ text: slides[currentSlide].narration }),
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    setAudioUrl(url);
                }
            } catch (error) {
                console.error("TTS Error:", error);
            }
        };

        fetchAudio();

        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [currentSlide, isPlaying]);

    // Play audio when URL is ready
    useEffect(() => {
        if (audioUrl && !isMuted && audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
        }
    }, [audioUrl, isMuted]);

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) setCurrentSlide(prev => prev + 1);
    };

    const prevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (audioRef.current) {
            if (!isMuted) audioRef.current.pause();
            else audioRef.current.play().catch(() => { });
        }
    };

    const skipTutorial = () => {
        setIsPlaying(false);
        onClose?.();
    };

    return (
        <div className="w-full h-screen relative overflow-hidden">
            {/* Audio Element */}
            <audio ref={audioRef} className="hidden" />

            {/* Background: Interactive Dashboard */}
            <BackgroundDashboard step={currentSlide} />

            {/* Center Content */}
            <div className="absolute inset-0 flex items-center justify-center p-4 md:p-8 z-10">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full flex items-center justify-center"
                    >
                        <CenterTextPanel
                            title={slides[currentSlide].title}
                            subtitle={slides[currentSlide].subtitle}
                        >
                            <p className="text-lg md:text-xl text-gray-700 leading-relaxed">
                                {slides[currentSlide].narration}
                            </p>
                        </CenterTextPanel>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Controls Overlay */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
                <div className="flex items-center gap-4 bg-white/40 backdrop-blur-xl rounded-full px-6 py-3 border border-white/60 shadow-2xl">
                    {/* Previous */}
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className="p-2 rounded-full bg-white/60 hover:bg-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft size={20} className="text-gray-700" />
                    </button>

                    {/* Progress dots */}
                    <div className="flex gap-2">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`h-2 rounded-full transition-all ${i === currentSlide
                                    ? 'w-8 bg-primary-500'
                                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                                    }`}
                            />
                        ))}
                    </div>

                    {/* Next */}
                    <button
                        onClick={nextSlide}
                        disabled={currentSlide === slides.length - 1}
                        className="p-2 rounded-full bg-white/60 hover:bg-white/80 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight size={20} className="text-gray-700" />
                    </button>

                    {/* Mute */}
                    <button
                        onClick={toggleMute}
                        className="p-2 rounded-full bg-white/60 hover:bg-white/80 transition-all ml-2"
                    >
                        {isMuted ? <VolumeX size={20} className="text-gray-700" /> : <Volume2 size={20} className="text-gray-700" />}
                    </button>
                </div>
            </div>

            {/* Skip Button */}
            <button
                onClick={skipTutorial}
                className="absolute top-6 right-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/40 backdrop-blur-xl rounded-full border border-white/60 shadow-lg hover:bg-white/60 transition-all group"
            >
                <span className="text-sm font-bold text-gray-700">Saltar</span>
                <SkipForward size={16} className="text-gray-700 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Close Button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-6 left-6 z-20 p-2 bg-white/40 backdrop-blur-xl rounded-full border border-white/60 shadow-lg hover:bg-white/60 transition-all"
                >
                    <X size={20} className="text-gray-700" />
                </button>
            )}
        </div>
    );
};