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

// --- CARD 2: MISSION & VISION ---
export const CardMission: React.FC = () => {
  return (
    <div className="h-full bg-white rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col justify-center relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-bl-[100px] -z-0 transition-transform duration-700 group-hover:scale-110"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
           <div className="p-2 bg-primary-100 text-primary-600 rounded-lg">
             <Target size={20} />
           </div>
           <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Identidad Verbal</span>
        </div>
        
        <h2 className="text-4xl md:text-6xl font-bold text-brand-dark leading-[0.9] mb-8">
          Redefiniendo la <br/>
          <span className="text-primary-500">experiencia humana</span> <br/>
          a través de la ciencia.
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-auto">
           <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Misión</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Democratizar el acceso a tecnologías regenerativas avanzadas, simplificando lo complejo para mejorar la vida cotidiana.
              </p>
           </div>
           <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Visión</h3>
              <p className="text-gray-500 leading-relaxed text-sm">
                Ser el estándar global en biotecnología de consumo para el año 2030, liderando con ética e innovación.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

// --- CARD 3: PERSONALITY & TONE ---
export const CardTone: React.FC = () => {
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
          <div className="group/item cursor-default">
             <h3 className="text-2xl font-bold mb-1 group-hover/item:text-primary-400 transition-colors">Empático</h3>
             <p className="text-sm text-gray-300">Cercano pero no invasivo. Entendemos el dolor del usuario.</p>
          </div>
          <div className="w-full h-px bg-white/10"></div>
          <div className="group/item cursor-default">
             <h3 className="text-2xl font-bold mb-1 group-hover/item:text-primary-400 transition-colors">Clínico</h3>
             <p className="text-sm text-gray-300">Preciso. Sin ambigüedades. Basado en datos.</p>
          </div>
          <div className="w-full h-px bg-white/10"></div>
          <div className="group/item cursor-default">
             <h3 className="text-2xl font-bold mb-1 group-hover/item:text-primary-400 transition-colors">Visionario</h3>
             <p className="text-sm text-gray-300">Inspirador. Siempre mirando hacia el futuro.</p>
          </div>
       </div>

       <div className="mt-8 pt-6 border-t border-white/10">
          <p className="text-xs text-white/50 uppercase font-bold mb-2">Elevator Pitch</p>
          <p className="text-sm italic text-white/80">"Regenetix no es solo salud, es la evolución consciente de tu bienestar biológico."</p>
       </div>
    </div>
  );
};

// --- CARD 4: LOGO CONSTRUCTION ---
export const CardLogo: React.FC = () => {
  return (
    <div className="h-full bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex flex-col relative group overflow-hidden">
       {/* Background Grid */}
       <div className="absolute inset-0" style={{ 
           backgroundImage: 'linear-gradient(#f0f0f0 1px, transparent 1px), linear-gradient(90deg, #f0f0f0 1px, transparent 1px)', 
           backgroundSize: '20px 20px',
           opacity: 0.5
       }}></div>

       <div className="relative z-10 flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gray-100 rounded-lg text-gray-700"><PenTool size={18}/></div>
            <span className="text-sm font-bold text-gray-500 uppercase">Logotipo</span>
          </div>
          <span className="text-xs font-mono text-gray-400">Ratio 1:1.618</span>
       </div>

       <div className="flex-1 flex items-center justify-center relative z-10">
          <div className="relative w-48 h-48 flex items-center justify-center group-hover:scale-105 transition-transform duration-500">
             {/* Logo Construction Guidelines (Mock) */}
             <div className="absolute inset-0 border border-primary-500/20 rounded-full"></div>
             <div className="absolute inset-4 border border-primary-500/20 rounded-full"></div>
             <div className="absolute top-1/2 left-0 w-full h-px bg-primary-500/20"></div>
             <div className="absolute left-1/2 top-0 w-px h-full bg-primary-500/20"></div>
             
             {/* The Logo Shape (X/Helix concept) */}
             <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 20C20 20 40 50 50 50C60 50 80 20 80 20" stroke="#F20F79" strokeWidth="12" strokeLinecap="round"/>
                <path d="M20 80C20 80 40 50 50 50C60 50 80 80 80 80" stroke="#465362" strokeWidth="12" strokeLinecap="round"/>
             </svg>
          </div>
       </div>

       <div className="relative z-10 flex gap-4 mt-6">
          <div className="flex-1 bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
             <span className="block text-xs text-gray-400 mb-1">Clearspace</span>
             <span className="font-bold text-gray-700">24px</span>
          </div>
          <div className="flex-1 bg-gray-50 p-3 rounded-xl text-center border border-gray-100">
             <span className="block text-xs text-gray-400 mb-1">Min Width</span>
             <span className="font-bold text-gray-700">80px</span>
          </div>
       </div>
    </div>
  );
};

// --- CARD 5: COLOR PALETTE ---
export const CardColors: React.FC = () => {
  return (
    <div className="h-full bg-white rounded-[40px] shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        
        <div className="p-8 pb-0">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-700"><Palette size={18}/></div>
                <span className="text-sm font-bold text-gray-500 uppercase">Cromatismo</span>
            </div>
        </div>

        <div className="flex-1 flex flex-col md:flex-row">
            {/* Primary Magenta */}
            <div className="flex-1 bg-primary-500 p-6 flex flex-col justify-between text-white group hover:flex-[1.5] transition-all duration-500">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold opacity-60 uppercase">Primario</span>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                    <h4 className="text-2xl font-bold mb-1">Magenta</h4>
                    <p className="font-mono text-xs opacity-80">HEX #F20F79</p>
                    <p className="font-mono text-xs opacity-80">PMS 213 C</p>
                </div>
            </div>

            {/* Dark Slate */}
            <div className="flex-1 bg-brand-dark p-6 flex flex-col justify-between text-white group hover:flex-[1.5] transition-all duration-500">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold opacity-60 uppercase">Base</span>
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div>
                    <h4 className="text-2xl font-bold mb-1">Slate</h4>
                    <p className="font-mono text-xs opacity-80">HEX #465362</p>
                    <p className="font-mono text-xs opacity-80">PMS 432 C</p>
                </div>
            </div>

            {/* Light Grey */}
            <div className="flex-1 bg-[#F4F7FE] p-6 flex flex-col justify-between text-brand-dark group hover:flex-[1.5] transition-all duration-500">
                <div className="flex justify-between items-start">
                    <span className="text-xs font-bold opacity-60 uppercase">Fondo</span>
                    <div className="w-2 h-2 bg-brand-dark rounded-full"></div>
                </div>
                <div>
                    <h4 className="text-2xl font-bold mb-1">Ice</h4>
                    <p className="font-mono text-xs opacity-60">HEX #F4F7FE</p>
                    <p className="font-mono text-xs opacity-60">C2 M1 Y0 K0</p>
                </div>
            </div>
        </div>
    </div>
  );
};

// --- CARD 6: TYPOGRAPHY ---
export const CardTypography: React.FC = () => {
  return (
    <div className="h-full bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center gap-10">
        
        {/* Left: Specimen */}
        <div className="w-full md:w-1/3 flex flex-col items-center justify-center border-r border-gray-100 pr-0 md:pr-10">
            <span className="text-[120px] leading-none font-sans font-bold text-transparent bg-clip-text bg-gradient-to-br from-brand-dark to-gray-400">
                Aa
            </span>
            <div className="mt-4 text-center">
                <h3 className="text-xl font-bold text-brand-dark">Inter</h3>
                <p className="text-xs text-gray-400">Google Font / Sans Serif</p>
            </div>
        </div>

        {/* Right: Usage */}
        <div className="w-full md:w-2/3 space-y-6">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-gray-100 rounded-lg text-gray-700"><Type size={18}/></div>
                <span className="text-sm font-bold text-gray-500 uppercase">Jerarquía Tipográfica</span>
            </div>

            <div>
                <span className="text-xs text-primary-500 font-bold uppercase mb-1 block">Display / H1</span>
                <p className="text-4xl font-extrabold text-brand-dark tracking-tight">The Quick Brown Fox</p>
            </div>
            <div>
                <span className="text-xs text-primary-500 font-bold uppercase mb-1 block">Heading / H2</span>
                <p className="text-2xl font-semibold text-brand-dark">Jumps over the lazy dog.</p>
            </div>
            <div>
                <span className="text-xs text-gray-400 font-bold uppercase mb-1 block">Body / P</span>
                <p className="text-sm text-gray-500 leading-relaxed max-w-md">
                    Inter es una tipografía diseñada específicamente para pantallas de ordenador. Cuenta con una gran altura de la x para mejorar la legibilidad en tamaños pequeños.
                </p>
            </div>
        </div>
    </div>
  );
};

// --- CARD 7: ICONOGRAPHY ---
export const CardIconography: React.FC = () => {
  return (
    <div className="h-full bg-primary-50 rounded-[40px] p-8 shadow-sm flex flex-col relative overflow-hidden">
        
        <div className="relative z-10 flex justify-between items-start mb-6">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-white rounded-lg text-primary-500"><Grid size={18}/></div>
                <span className="text-sm font-bold text-primary-900/50 uppercase">Iconografía</span>
            </div>
        </div>

        <div className="grid grid-cols-3 gap-4 flex-1 content-center relative z-10">
            {[Heart, Zap, Eye, Box, Layers, Target].map((Icon, idx) => (
                <div key={idx} className="aspect-square bg-white rounded-2xl flex items-center justify-center text-primary-500 shadow-sm hover:scale-110 transition-transform cursor-pointer">
                    <Icon strokeWidth={2} size={24} />
                </div>
            ))}
        </div>
        
        <p className="relative z-10 mt-6 text-xs text-primary-800/60 text-center font-medium">
            Estilo lineal, stroke 2px, esquinas redondeadas.
        </p>

        {/* Background decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-t from-primary-100/50 to-transparent pointer-events-none"></div>
    </div>
  );
};

// --- CARD 8: PATTERNS & GRAPHICS ---
export const CardPatterns: React.FC = () => {
    return (
      <div className="h-full bg-white rounded-[40px] overflow-hidden shadow-sm border border-gray-100 relative group">
          <div className="absolute inset-0 z-0">
             {/* Pattern Creation using CSS Gradients */}
             <div className="w-full h-full opacity-10" style={{
                 backgroundImage: 'radial-gradient(#465362 2px, transparent 2px)',
                 backgroundSize: '30px 30px'
             }}></div>
             <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-primary-500/20 to-transparent rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3"></div>
          </div>
  
          <div className="relative z-10 p-8 h-full flex flex-col">
              <div className="flex items-center gap-2 mb-auto">
                  <div className="p-2 bg-gray-100 rounded-lg text-gray-700"><Layers size={18}/></div>
                  <span className="text-sm font-bold text-gray-500 uppercase">Recursos Gráficos</span>
              </div>
              
              <div className="space-y-4">
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-200">
                      <span className="text-xs font-bold text-brand-dark block mb-1">Formas Orgánicas</span>
                      <div className="h-2 w-full bg-gradient-to-r from-primary-500 to-transparent rounded-full"></div>
                  </div>
                  <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-200">
                      <span className="text-xs font-bold text-brand-dark block mb-1">Micro-texturas</span>
                      <div className="h-8 w-full border border-dashed border-gray-300 rounded-lg bg-gray-50"></div>
                  </div>
              </div>
          </div>
      </div>
    );
  };

// --- CARD 9: STATIONERY & MOCKUPS ---
export const CardStationery: React.FC = () => {
    return (
        <div className="h-full bg-[#E5E9F2] rounded-[40px] overflow-hidden relative group">
            <div className="absolute inset-0 flex items-center justify-center p-8">
                {/* ID Card Mockup */}
                <div className="w-48 h-72 bg-white rounded-2xl shadow-xl transform rotate-[-5deg] group-hover:rotate-0 transition-all duration-500 flex flex-col overflow-hidden relative z-10">
                    <div className="h-24 bg-brand-dark relative">
                        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-gray-200 rounded-full border-4 border-white overflow-hidden">
                             <img src="https://picsum.photos/id/64/100/100" className="w-full h-full object-cover" alt="User"/>
                        </div>
                    </div>
                    <div className="mt-8 text-center px-4">
                        <h4 className="font-bold text-gray-800 text-sm">Sarah Connor</h4>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wider">Product Lead</p>
                    </div>
                    <div className="mt-auto p-4 bg-gray-50">
                        <div className="h-2 w-20 bg-gray-200 rounded-full mx-auto"></div>
                    </div>
                </div>

                {/* Business Card Mockup (Behind) */}
                <div className="absolute w-56 h-32 bg-primary-500 rounded-xl shadow-lg transform rotate-[10deg] translate-x-12 translate-y-12 flex items-center justify-center">
                    <span className="text-white font-bold text-lg tracking-widest">REGENETIX</span>
                </div>
            </div>
            
            <div className="absolute top-8 left-8">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-white/50 backdrop-blur-md rounded-lg text-brand-dark"><Box size={18}/></div>
                  <span className="text-sm font-bold text-brand-dark/50 uppercase">Papelería</span>
                </div>
            </div>
        </div>
    );
};

// --- CARD 10: VALUES ---
export const CardValues: React.FC = () => {
    return (
      <div className="h-full bg-white rounded-[40px] p-8 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center gap-2 mb-6">
               <div className="p-2 bg-primary-50 rounded-lg text-primary-500"><Smartphone size={18}/></div>
               <span className="text-sm font-bold text-gray-500 uppercase">Valores Centrales</span>
          </div>

          <div className="flex-1 space-y-3">
              {[
                  { title: "Innovación Ética", desc: "Avanzar sin romper." },
                  { title: "Transparencia Radical", desc: "Datos abiertos al usuario." },
                  { title: "Diseño Humano", desc: "Tecnología que se siente natural." }
              ].map((val, i) => (
                  <div key={i} className="group cursor-pointer">
                      <div className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors">
                          <div>
                              <h4 className="font-bold text-brand-dark text-sm">{val.title}</h4>
                              <p className="text-xs text-gray-400">{val.desc}</p>
                          </div>
                          <div className="w-2 h-2 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
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