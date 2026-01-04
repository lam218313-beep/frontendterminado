import React from 'react';

// Simple SVG placeholders for logos to avoid external image dependencies
const PixelyLogo = () => (
  <svg width="80" height="80" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="md:w-[100px] md:h-[100px]">
    <circle cx="20" cy="20" r="20" fill="white" className="shadow-2xl"/>
    <path d="M20 10C14.477 10 10 14.477 10 20C10 25.523 14.477 30 20 30C25.523 30 30 25.523 30 20" stroke="#d946ef" strokeWidth="3" strokeLinecap="round"/>
    <path d="M20 10V30" stroke="#d946ef" strokeWidth="3" strokeLinecap="round"/>
    <path d="M10 20H30" stroke="#d946ef" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const PartnerLogo = ({ label, color = "#6B7280" }: { label: string; color?: string }) => (
  <div className="bg-white rounded-full p-3 shadow-xl flex items-center justify-center w-16 h-16 md:w-20 md:h-20 border-2 border-white/80 backdrop-blur-sm hover:scale-110 transition-transform duration-300 cursor-pointer">
    <div className="text-xs md:text-sm font-bold text-center leading-tight" style={{ color }}>
      {label}
    </div>
  </div>
);

const OrbitalHero: React.FC = () => {
  return (
    <div className="relative w-full h-[600px] md:h-[750px] flex items-center justify-center overflow-visible bg-[#F4F7FE]">
      
      {/* Central Hub */}
      <div className="absolute z-30 flex flex-col items-center justify-center">
        <PixelyLogo />
      </div>

      {/* Orbit 1 (Inner) - Smallest */}
      <div className="absolute w-[300px] h-[300px] md:w-[380px] md:h-[380px] border border-magenta-500/20 rounded-full animate-orbit-slow pointer-events-none">
        {/* Items on Orbit 1 */}
        {/* Top (12 o'clock) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
           <div className="animate-reverse-orbit-slow">
             <PartnerLogo label="Google" color="#EA4335"/>
           </div>
        </div>
        {/* Bottom (6 o'clock) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 pointer-events-auto">
           <div className="animate-reverse-orbit-slow">
             <PartnerLogo label="Meta" color="#0668E1"/>
           </div>
        </div>
      </div>

      {/* Orbit 2 (Middle) - Equilateral Triangle Layout */}
      <div className="absolute w-[500px] h-[500px] md:w-[600px] md:h-[600px] border border-magenta-500/20 rounded-full animate-orbit-medium pointer-events-none">
         
         {/* Item 1: Top Left (300 degrees / 10 o'clock position) 
             Math: Top = 25%, Left = 6.7% for exact 120 deg separation from bottom */}
        <div className="absolute top-[25%] left-[6.7%] -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
           <div className="animate-reverse-orbit-medium">
             <PartnerLogo label="Intel" color="#0068B5"/>
           </div>
        </div>

        {/* Item 2: Top Right (60 degrees / 2 o'clock position)
            Math: Top = 25%, Right = 6.7% */}
        <div className="absolute top-[25%] right-[6.7%] translate-x-1/2 -translate-y-1/2 pointer-events-auto">
           <div className="animate-reverse-orbit-medium">
             <PartnerLogo label="AWS" color="#FF9900"/>
           </div>
        </div>

        {/* Item 3: Bottom Center (180 degrees / 6 o'clock position) */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 pointer-events-auto">
           <div className="animate-reverse-orbit-medium">
             <PartnerLogo label="Microsoft" color="#737373"/>
           </div>
        </div>
      </div>

      {/* Orbit 3 (Outer) - Square Layout */}
      <div className="absolute w-[700px] h-[700px] md:w-[850px] md:h-[850px] border border-magenta-500/20 rounded-full animate-orbit-fast pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
           <div className="animate-reverse-orbit-fast">
             <PartnerLogo label="OpenAI" color="#10A37F"/>
           </div>
        </div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 pointer-events-auto">
           <div className="animate-reverse-orbit-fast">
             <PartnerLogo label="Nvidia" color="#76B900"/>
           </div>
        </div>
        <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
           <div className="animate-reverse-orbit-fast">
             <PartnerLogo label="IBM" color="#006699"/>
           </div>
        </div>
        <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 pointer-events-auto">
           <div className="animate-reverse-orbit-fast">
             <PartnerLogo label="Oracle" color="#C74634"/>
           </div>
        </div>
      </div>

      {/* Decorative Background Glow - Scaled Up */}
      <div className="absolute w-[900px] h-[900px] bg-magenta-400/5 rounded-full blur-3xl -z-10"></div>
    </div>
  );
};

export default OrbitalHero;