import React from 'react';
import OrbitalHero from './OrbitalHero';
import TetrisCards from './TetrisCards';

const PartnersPage: React.FC = () => {
  return (
    <div className="w-full min-h-screen flex flex-col items-center pb-20 bg-[#F4F7FE] overflow-x-hidden">
      
      {/* Header Text - Enhanced Typography */}
      <div className="text-center pt-20 pb-12 px-4 z-10 animate-fade-in-up max-w-4xl mx-auto">
        <span className="text-magenta-600 font-bold tracking-[0.2em] uppercase text-sm md:text-base mb-4 block">
          Sigma Studio Partner
        </span>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-8 leading-tight tracking-tight">
          Technologies & Partners <br className="hidden lg:block"/> with Pixely
        </h1>
        <p className="max-w-3xl mx-auto text-gray-500 text-xl md:text-2xl leading-relaxed font-light">
          Our goals are ambitious and can only be achieved in partnership with others. 
          We collaborate with a number of technology partners who help us bring about change.
        </p>
      </div>

      {/* Hero Section - Orbital System */}
      <div className="w-full flex justify-center mb-16 relative overflow-hidden">
         {/* Gradient Fade for seamless integration */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#F4F7FE] to-transparent z-40 pointer-events-none"></div>
        <OrbitalHero />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#F4F7FE] to-transparent z-40 pointer-events-none"></div>
      </div>

      {/* Bottom Section - Tetris/Bento Grid */}
      {/* Container widened to fit the "Tetris" feel better */}
      <div className="w-full max-w-7xl px-4 md:px-8 z-20">
        <div className="mb-10 flex items-center space-x-4">
          <div className="h-12 w-1 bg-magenta-500 rounded-full"></div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Capabilities</h2>
        </div>
        <TetrisCards />
      </div>

    </div>
  );
};

export default PartnersPage;