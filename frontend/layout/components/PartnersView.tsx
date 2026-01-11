import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import OrbitalHero from './OrbitalHero';
import TetrisCards from './TetrisCards';
import { TutorialModal } from './TutorialModal';

interface PartnersViewProps {
  onShowTutorial?: () => void;
}

const TUTORIAL_SLIDES = [
  {
    title: "Bienvenido a Pixely Partners",
    description: "Somos una agencia de marketing que pone a tu disposición todo nuestro ecosistema tecnológico. No vendemos herramientas... ofrecemos resultados. Validamos tu mercado, identificamos oportunidades reales y eliminamos la incertidumbre de tus decisiones.",
    animationType: 'particles' as const,
    audioUrl: "/assets/audio/tutorial_step1_intro.mp3"
  },
  {
    title: "Fase 1: Tu Identidad (Entrevista)",
    description: "Fase 01.- La entrevista: En esta etapa, nos centraremos en conocerte, saber sobre tu marca, tus productos y sus precios, tus clientes usuales y tu forma de competir en tu mercado. Aprovecharemos esa información para sentar las bases de los posteriores análisis y estrategias a desarrollar. Además, conoceremos a tu cliente ideal y al no deseado, es importante saber para quién trabajamos!",
    animationType: 'neural' as const,
    audioUrl: "/assets/audio/tutorial_step2_interview.mp3"
  },
  {
    title: "Fase 2: Manual de Marca",
    description: "Fase 02: En esta etapa, tras conocer tu empresa, los valores que la definen y el cliente que esperamos recibir, creamos una marca: un diseño específico para transmitir exactamente lo que tu empresa representa. De esta manera, tu marca acumulará valor con cada estrategia desarrollada.",
    animationType: 'dna' as const,
    audioUrl: "/assets/audio/tutorial_step3_brand.mp3"
  },
  {
    title: "Fase 3: Análisis Profundo",
    description: "Fase 03: Nuestros sistemas de análisis, recopilan la información de tus redes sociales y tendencias de mercado en tiempo real. Cruzamos miles de datos con metodologías estadísticas para encontrar oportunidades de crecimiento y mejora. Gracias a este sistema, obtendrás siempre una respuesta a cada estrategia virtual que implementes.",
    animationType: 'network' as const,
    audioUrl: "/assets/audio/tutorial_step4_analysis.mp3"
  },
  {
    title: "Fase 4: Estrategia Accionable",
    description: "Fase 04: Ya conocimos a detalle tu mercado y tu lugar en él, lo que sigue, es trazar estrategias para cumplir con tus objetivos. Desarrollaremos estrategias que te permitan crecer sin adivinar ni cometer errores de novatos. Todo basado en evidencia real.",
    animationType: 'grid' as const,
    audioUrl: "/assets/audio/tutorial_step5_strategy.mp3"
  },
  {
    title: "Fase 5: Ejecución (Planificación)",
    description: "Finalmente, convertimos la estrategia en tareas diarias en tu tablero Kanban. Sabrás exactamente qué hacer y cuándo. Si tenemos que publicar un vídeo, podrás aprobarlo en un click ¡Olvídate de publicaciones que no se hacen!",
    animationType: 'waves' as const,
    audioUrl: "/assets/audio/tutorial_step6_planning.mp3"
  },
  {
    title: "Desbloquea Más Poder con el Tiempo",
    description: "Fase 06: A más tiempo trabajamos juntos, más desbloqueamos. Accede a análisis más profundos, estrategias más avanzadas y herramientas exclusivas. Por ejemplo: análisis predictivo de tendencias, campañas automatizadas personalizadas, y consultoría estratégica prioritaria. Tu crecimiento acelera con cada mes.",
    animationType: 'pulse' as const,
    audioUrl: "/assets/audio/tutorial_step7_benefits.mp3"
  },
  {
    title: "¡Estamos Listos para Ti!",
    description: "Gracias por conocer Pixely Partners. Estamos emocionados de trabajar contigo. El primer paso es sencillo: completa la entrevista inicial para que conozcamos tu marca a fondo. Desde ahí, construiremos juntos tu camino hacia el éxito. ¡Empecemos!",
    animationType: 'sparkles' as const,
    audioUrl: "/assets/audio/tutorial_step8_closing.mp3"
  }
];

const PartnersView: React.FC<PartnersViewProps> = ({ onShowTutorial }) => {
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // Auto-open tutorial for new users
  useEffect(() => {
    const hasSeen = localStorage.getItem('pixely_partners_tutorial_seen');
    if (!hasSeen) {
      // Small delay for better UX on entry
      const timer = setTimeout(() => {
        setIsTutorialOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleOpenTutorial = () => {
    setIsTutorialOpen(true);
  };

  const handleCloseTutorial = () => {
    setIsTutorialOpen(false);
    localStorage.setItem('pixely_partners_tutorial_seen', 'true');
  };

  return (
    <div className="col-span-12 flex flex-col items-center pb-10 overflow-x-hidden bg-brand-bg relative">

      {/* Tutorial Modal */}
      <TutorialModal
        isOpen={isTutorialOpen}
        onClose={handleCloseTutorial}
        slides={TUTORIAL_SLIDES}
      />

      {/* Header Text - Enhanced Typography */}
      <div className="text-center pt-10 pb-12 px-4 z-10 animate-fade-in-up max-w-4xl mx-auto">
        <span className="text-primary-600 font-bold tracking-[0.2em] uppercase text-sm md:text-base mb-4 block">
          Pixely Partners
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
          Tecnología y Partners <br className="hidden lg:block" /> con Pixely
        </h1>
        <p className="max-w-3xl mx-auto text-gray-500 text-xl md:text-2xl leading-relaxed font-light mb-8">
          No somos una herramienta pasiva; somos una alianza bilateral donde nuestra tecnología diagnostica, valida tu mercado y minimiza la incertidumbre en tus decisiones.
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={handleOpenTutorial}
            className="px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold shadow-lg shadow-white/10 hover:shadow-xl hover:scale-105 transition-all flex items-center gap-3 border border-slate-200"
          >
            <Zap size={20} className="text-yellow-500 fill-yellow-500" /> Ver Tutorial
          </button>
        </div>
      </div>

      {/* Hero Section - Orbital System */}
      <div className="w-full flex justify-center mb-16 relative overflow-hidden">
        {/* Gradient Fade for seamless integration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-brand-bg to-transparent z-40 pointer-events-none"></div>
        <OrbitalHero />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-brand-bg to-transparent z-40 pointer-events-none"></div>
      </div>

      {/* Bottom Section - Tetris/Bento Grid */}
      <div className="w-full max-w-7xl px-4 md:px-8 z-20">
        <div className="mb-10 flex items-center space-x-4">
          <div className="h-12 w-1 bg-primary-500 rounded-full"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Capacidades</h2>
        </div>
        <TetrisCards />
      </div>

    </div>
  );
};

export default PartnersView;
