import React from 'react';

export const WikiTrendChart: React.FC = () => {
  // Definition of the curve path
  const pathD = "M 0 150 C 50 150, 80 160, 120 130 S 180 30, 210 50 S 280 150, 380 120";

  return (
    <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 h-full min-h-[320px] relative overflow-hidden flex items-center justify-center animate-fade-in-up">
       
       {/* SVG Grid Background */}
       <div className="absolute inset-0 pointer-events-none opacity-40" 
            style={{ 
                backgroundImage: 'linear-gradient(#f3f4f6 1px, transparent 1px), linear-gradient(90deg, #f3f4f6 1px, transparent 1px)', 
                backgroundSize: '40px 40px' 
            }}>
       </div>

       {/* Left Axis Mock */}
       <div className="absolute left-8 top-8 bottom-8 flex flex-col justify-between py-4">
          {[100, 75, 50, 25, 0].map((val) => (
             <div key={val} className="flex items-center gap-2">
                 <div className="w-2 h-0.5 bg-gray-300"></div>
             </div>
          ))}
       </div>

        {/* Bottom Axis Mock */}
       <div className="absolute left-8 right-8 bottom-8 flex justify-between px-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((val) => (
             <div key={val} className="flex flex-col items-center gap-2">
                 <div className="w-0.5 h-2 bg-gray-300"></div>
             </div>
          ))}
       </div>

       {/* The Curve Container */}
       <div className="relative w-full h-full p-12">
          <svg viewBox="0 0 400 200" className="w-full h-full overflow-visible">
             <defs>
                <linearGradient id="lineGradientWiki" x1="0" y1="0" x2="1" y2="0">
                   <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.5" />
                   <stop offset="100%" stopColor="#38bdf8" stopOpacity="1" />
                </linearGradient>
                <filter id="glowBlue">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
             </defs>
             
             {/* The Visible Path */}
             <path 
                id="motionPathWiki"
                d={pathD}
                fill="none"
                stroke="url(#lineGradientWiki)"
                strokeWidth="4"
                strokeLinecap="round"
                filter="url(#glowBlue)"
                className="drop-shadow-sm"
             />

             {/* The Ball following the path with Physics (Accel/Decel) */}
             <circle r="8" fill="white" stroke="#0ea5e9" strokeWidth="3">
                <animateMotion 
                   dur="4s" 
                   repeatCount="indefinite"
                   calcMode="spline"
                   keyTimes="0;0.5;1"
                   keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" 
                >
                   <mpath href="#motionPathWiki" />
                </animateMotion>
                
                {/* Pulsing effect on the ball */}
                <animate attributeName="stroke-width" values="3;6;3" dur="2s" repeatCount="indefinite" />
             </circle>
             
             {/* Trail Effect (Second ball lagging behind slightly) */}
             <circle r="4" fill="#0ea5e9" opacity="0.5">
                <animateMotion 
                   dur="4s" 
                   begin="0.1s"
                   repeatCount="indefinite"
                   calcMode="spline"
                   keyTimes="0;0.5;1"
                   keySplines="0.4 0 0.2 1; 0.4 0 0.2 1" 
                >
                   <mpath href="#motionPathWiki" />
                </animateMotion>
             </circle>

          </svg>
       </div>

    </div>
  );
};
