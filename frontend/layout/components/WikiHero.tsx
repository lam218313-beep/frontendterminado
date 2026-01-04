import React, { useState, useMemo } from 'react';

const WikiHero: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Memoize bars to maintain stable random values across renders
  const bars = useMemo(() => Array.from({ length: 64 }).map((_, i) => ({
    // Base height using sine wave for organic look + random noise
    baseHeight: 15 + Math.sin(i * 0.1) * 40 + Math.random() * 20,
    animationDelay: i * 0.02,
    animationDuration: 2 + Math.random()
  })), []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    // Map x position to bar index (0 to 63)
    const index = Math.floor((x / rect.width) * 64);
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div 
      className="w-full bg-white rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden min-h-[450px] group hover:shadow-lg transition-all duration-500 cursor-crosshair"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      
      {/* Background Decor: Animated Wave - Full Width & Interactive */}
      <div className="absolute bottom-0 left-0 right-0 h-64 flex items-end justify-between gap-[2px] pointer-events-none z-0">
         {bars.map((bar, i) => {
            // Determine interaction growth based on cursor proximity
            let growth = 0;
            let isActive = false;

            if (hoveredIndex !== null) {
                const dist = Math.abs(hoveredIndex - i);
                if (dist <= 3) {
                   // Gaussian-like distribution for smooth growth
                   const boost = [50, 40, 25, 10];
                   growth = boost[dist];
                   isActive = true;
                }
            }

            return (
            <div 
              key={i}
              className={`flex-1 rounded-t-sm origin-bottom transition-all duration-200 ease-out 
                ${isActive 
                    ? 'bg-gradient-to-t from-primary-400 to-primary-600 opacity-100' 
                    : 'bg-gradient-to-t from-primary-100 to-primary-300 opacity-30'
                } 
                ${hoveredIndex === null ? 'animate-wave-bar' : ''}`}
              style={{ 
                height: `${Math.min(100, bar.baseHeight + growth)}%`,
                animationDelay: `${bar.animationDelay}s`,
                animationDuration: `${bar.animationDuration}s`
              }}
            ></div>
         )})}
      </div>

      {/* Full Container Blur Overlay - Less Dense */}
      <div className="absolute inset-0 w-full h-full bg-white/30 backdrop-blur-sm z-10 p-8 md:p-12 flex flex-col justify-center pointer-events-none">
          
        <div className="relative max-w-xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/50 mb-8 w-fit animate-fade-in-up shadow-sm" style={{ animationDelay: '0.2s' }}>
                <div className="w-2 h-2 rounded-full bg-primary-500 animate-pulse"></div>
                <span className="text-[10px] md:text-xs font-bold tracking-widest text-gray-700 uppercase">Análisis Activo</span>
            </div>

            {/* Title */}
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 tracking-tighter leading-[0.9] mb-4 animate-fade-in-up mix-blend-darken" style={{ animationDelay: '0.4s' }}>
                Wiki <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 font-light group-hover:from-primary-500 group-hover:to-primary-700 transition-all duration-500">Metodología.</span>
            </h1>

            {/* Decorative Line & Desc */}
            <div className="flex items-stretch gap-6 mt-8 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                <div className="w-1.5 rounded-full bg-primary-500 group-hover:scale-y-110 transition-transform duration-500 shadow-sm"></div>
                <p className="text-lg text-gray-700 max-w-md leading-relaxed group-hover:text-gray-900 transition-colors duration-500 font-medium">
                    Explora nuestra arquitectura de decisiones estratégicas impulsada por datos.
                </p>
            </div>
        </div>

      </div>
    </div>
  );
};

export default WikiHero;
