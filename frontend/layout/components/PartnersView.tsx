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
    description: "Descubre cómo nuestra tecnología de IA valida tu mercado y minimiza la incertidumbre en tus decisiones estratégicas.",
    image: "https://images.unsplash.com/photo-1639322537228-ad7117a767f1?q=80&w=1000&auto=format&fit=crop", // Abstract Tech
    audioUrl: "/assets/audio/tutorial_welcome.mp3" // Placeholder
  },
  {
    title: "Análisis Profundo",
    description: "Utilizamos agentes autónomos para escanear redes sociales, identificar tendencias y entender a tu audiencia real.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop", // Analytics
    audioUrl: "/assets/audio/tutorial_analysis.mp3"
  },
  {
    title: "Estrategia y Planificación",
    description: "Transformamos datos en estrategias accionables. Desde la definición de marca hasta el plan de contenidos diario.",
    image: "https://images.unsplash.com/photo-1553877615-30c73a63b4d4?q=80&w=1000&auto=format&fit=crop", // Strategy
    audioUrl: "/assets/audio/tutorial_strategy.mp3"
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
