import React, { useState, useRef, useCallback } from 'react';
import { LayoutDashboard, AlertTriangle, TrendingUp, Clock, Calendar, ChevronRight, Activity, Smile } from 'lucide-react';

interface Q10Data {
  alerta_prioritaria: string;
  hallazgos_clave: string[];
  kpis_principales: {
    emocion_dominante: string;
    emocion_porcentaje: number;
    personalidad_marca: string;
    sentimiento_positivo_pct: number;
    tendencia_temporal: 'Mejora' | 'Estable' | 'Deterioro';
    recomendaciones_criticas: number;
  };
  urgencias_por_prioridad: {
    '48_horas': string[];
    'semana_1': string[];
    'semanas_2_3': string[];
  };
}

interface CardLabsQ10_ExecutiveSummaryProps {
  data: Q10Data;
}

const GREEN = '#41ead4';
const RED = '#ee4266';

export const CardLabsQ10_ExecutiveSummary: React.FC<CardLabsQ10_ExecutiveSummaryProps> = ({ data }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  // 3D Tilt Logic
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Calibrated for larger card size
    const rotateX = ((y - centerY) / centerY) * -2; 
    const rotateY = ((x - centerX) / centerX) * 2;
    setRotation({ x: rotateX, y: rotateY });
  }, [isFlipped]);

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  // Meter Configuration
  const sentiment = data.kpis_principales.sentimiento_positivo_pct;
  // Semicircle calculations
  
  return (
    <div 
      className="relative w-full h-full min-h-[450px] [perspective:1000px] group cursor-pointer"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        ref={cardRef}
        className="w-full h-full relative transition-all duration-500 ease-out [transform-style:preserve-3d]"
        style={{
          transform: `rotateX(${isFlipped ? 0 : rotation.x}deg) rotateY(${isFlipped ? 180 : rotation.y}deg)`
        }}
      >
        {/* --- FRONT FACE: HUD DASHBOARD --- */}
        <div className="absolute inset-0 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 [backface-visibility:hidden] flex flex-col z-10">
          
          {/* Header */}
          <div className="flex justify-between items-center mb-6 shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary-500 rounded-2xl text-white shadow-lg shadow-primary-200">
                <LayoutDashboard size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">Resumen Ejecutivo</h3>
                <p className="text-sm text-gray-400 font-medium">Estado General del Proyecto</p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-green-50 text-green-700 px-3 py-1.5 rounded-full border border-green-100 shrink-0">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs font-bold tracking-wide">SISTEMA ACTIVO</span>
            </div>
          </div>

          {/* Main Layout: Top Alert + Split Content */}
          <div className="flex-1 flex flex-col gap-6 min-h-0">
             
             {/* 1. System Alert Banner */}
             <div className="bg-red-50 rounded-2xl p-4 border border-red-100 flex items-start gap-4 relative overflow-hidden group/alert shrink-0">
                 <div className="bg-white p-2 rounded-xl text-red-500 shadow-sm shrink-0">
                     <AlertTriangle size={24} />
                 </div>
                 <div className="relative z-10 min-w-0">
                     <h4 className="text-xs font-bold text-red-500 uppercase tracking-widest mb-1 truncate">Atención Requerida</h4>
                     <p className="text-sm font-bold text-gray-800 leading-snug line-clamp-2">
                         "{data.alerta_prioritaria}"
                     </p>
                 </div>
                 {/* Decor */}
                 <div className="absolute right-0 top-0 w-32 h-full bg-gradient-to-l from-red-100 to-transparent opacity-50 group-hover/alert:opacity-80 transition-opacity pointer-events-none"></div>
             </div>

             {/* 2. Split Content: Gauge vs Grid */}
             <div className="flex-1 flex gap-6 min-h-0">
                 
                 {/* Left: Main Gauge (Sentiment) */}
                 <div className="w-1/3 min-w-[180px] bg-gray-50/50 rounded-3xl border border-gray-100 flex flex-col items-center justify-center relative p-4 shrink-0">
                     <h4 className="absolute top-4 md:top-6 text-xs font-bold text-gray-400 uppercase tracking-widest text-center w-full">Sentimiento Global</h4>
                     
                     <div className="relative w-full aspect-square max-w-[160px] flex items-center justify-center">
                         <svg className="w-full h-full" viewBox="0 0 200 120">
                             {/* Background Arc */}
                             <path d="M 20 110 A 80 80 0 0 1 180 110" fill="none" stroke="#e5e7eb" strokeWidth="16" strokeLinecap="round" />
                             {/* Value Arc */}
                             <path 
                                d="M 20 110 A 80 80 0 0 1 180 110" 
                                fill="none" 
                                stroke={sentiment > 50 ? GREEN : RED} 
                                strokeWidth="16" 
                                strokeLinecap="round"
                                strokeDasharray={Math.PI * 80} // Half circumference approx 251
                                strokeDashoffset={Math.PI * 80 * (1 - sentiment/100)}
                                className="transition-all duration-1000 ease-out"
                             />
                         </svg>
                         <div className="absolute bottom-4 flex flex-col items-center">
                             <span className="text-4xl md:text-5xl font-extrabold text-gray-900 tracking-tighter">{sentiment}%</span>
                             <span className={`text-[10px] md:text-xs font-bold px-2 py-0.5 rounded ${sentiment > 50 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                 {sentiment > 50 ? 'POSITIVO' : 'NEGATIVO'}
                             </span>
                         </div>
                     </div>
                     
                     <div className="mt-1 md:mt-2 text-center px-2">
                         <p className="text-[9px] md:text-[10px] text-gray-400 leading-tight">
                             Basado en análisis semanal.
                         </p>
                     </div>
                 </div>

                 {/* Right: Key Metrics Grid */}
                 <div className="flex-1 flex flex-col gap-3 min-w-0">
                     
                     {/* Row 1 */}
                     <div className="flex-1 flex gap-3 min-h-0">
                         <div className="flex-1 bg-blue-50/50 rounded-2xl p-3 border border-blue-100 hover:bg-blue-50 transition-colors flex flex-col justify-between overflow-hidden">
                             <div className="flex justify-between items-start">
                                 <div className="p-1.5 bg-white rounded-lg text-blue-500 shadow-sm shrink-0"><Smile size={18}/></div>
                                 <span className="text-[10px] font-bold text-blue-400 uppercase ml-2 truncate">Emoción</span>
                             </div>
                             <div className="min-w-0">
                                 <span className="text-lg md:text-xl font-bold text-gray-900 block truncate" title={data.kpis_principales.emocion_dominante}>{data.kpis_principales.emocion_dominante}</span>
                                 <span className="text-xs text-blue-600 font-medium truncate block">{data.kpis_principales.emocion_porcentaje}% usuarios</span>
                             </div>
                         </div>
                         
                         <div className="flex-1 bg-purple-50/50 rounded-2xl p-3 border border-purple-100 hover:bg-purple-50 transition-colors flex flex-col justify-between overflow-hidden">
                             <div className="flex justify-between items-start">
                                 <div className="p-1.5 bg-white rounded-lg text-purple-500 shadow-sm shrink-0"><Activity size={18}/></div>
                                 <span className="text-[10px] font-bold text-purple-400 uppercase ml-2 truncate">Tendencia</span>
                             </div>
                             <div className="min-w-0">
                                 <span className="text-lg md:text-xl font-bold text-gray-900 block truncate">{data.kpis_principales.tendencia_temporal}</span>
                                 <div className="h-1 w-full bg-purple-200 rounded-full mt-2 overflow-hidden">
                                     <div className="h-full bg-purple-500 w-3/4"></div>
                                 </div>
                             </div>
                         </div>
                     </div>

                     {/* Row 2 (Full Width Block) */}
                     <div className="flex-1 min-h-0 bg-gray-50 rounded-2xl p-3 border border-gray-100 flex items-center justify-between group/block hover:border-gray-300 transition-colors overflow-hidden">
                         <div className="flex items-center gap-3 min-w-0">
                             <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 shadow-sm font-bold shrink-0">
                                 {data.kpis_principales.recomendaciones_criticas}
                             </div>
                             <div className="min-w-0">
                                 <h5 className="text-sm font-bold text-gray-900 truncate">Bloqueantes</h5>
                                 <p className="text-xs text-gray-500 truncate">Atención inmediata</p>
                             </div>
                         </div>
                         <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200 text-[10px] md:text-xs font-bold text-gray-600 group-hover/block:bg-gray-800 group-hover/block:text-white transition-colors shrink-0 ml-2 whitespace-nowrap">
                             Ver Detalles
                         </div>
                     </div>

                 </div>
             </div>

          </div>
        </div>

        {/* --- BACK FACE: TIMELINE (Refined) --- */}
        <div className="absolute inset-0 bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col z-20">
           <div className="flex justify-between items-center mb-8 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
                        <Calendar size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Hoja de Ruta</h3>
                </div>
                <span className="text-xs font-bold text-gray-400 bg-gray-50 px-3 py-1 rounded-full">Próximos Pasos</span>
           </div>

           <div className="flex-1 overflow-y-auto custom-scrollbar relative pl-4">
                {/* Vertical Connector Line */}
                <div className="absolute top-4 bottom-4 left-[27px] w-0.5 bg-gradient-to-b from-red-200 via-yellow-200 to-blue-200"></div>

                <div className="space-y-8">
                    {/* 48 Hours */}
                    <div className="relative pl-12 group">
                        <div className="absolute left-0 top-0 w-14 h-14 flex items-start justify-center">
                            <div className="w-10 h-10 rounded-full bg-red-50 border-4 border-white ring-1 ring-red-100 text-red-500 flex items-center justify-center shadow-sm z-10 group-hover:scale-110 transition-transform">
                                <Clock size={16} />
                            </div>
                        </div>
                        <div className="bg-red-50/30 p-4 rounded-2xl border border-red-50 hover:bg-red-50 transition-colors">
                            <h4 className="text-sm font-bold text-red-600 uppercase tracking-wide mb-3 flex justify-between">
                                Inmediato (48h)
                                <span className="text-[10px] bg-red-100 px-2 py-0.5 rounded-full">Crítico</span>
                            </h4>
                            <ul className="space-y-2">
                                {data.urgencias_por_prioridad['48_horas'].map((item, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700 font-medium">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></div>
                                        <span className="leading-snug">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Week 1 */}
                    <div className="relative pl-12 group">
                        <div className="absolute left-0 top-0 w-14 h-14 flex items-start justify-center">
                             <div className="w-10 h-10 rounded-full bg-yellow-50 border-4 border-white ring-1 ring-yellow-100 text-yellow-600 flex items-center justify-center shadow-sm z-10 group-hover:scale-110 transition-transform">
                                <Calendar size={16} />
                            </div>
                        </div>
                         <div className="p-2">
                            <h4 className="text-sm font-bold text-yellow-600 uppercase tracking-wide mb-2">Esta Semana</h4>
                            <ul className="space-y-2">
                                {data.urgencias_por_prioridad['semana_1'].map((item, i) => (
                                    <li key={i} className="text-sm text-gray-600 border-b border-gray-50 pb-1 last:border-0 leading-snug">
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Weeks 2-3 */}
                    <div className="relative pl-12 group">
                         <div className="absolute left-0 top-0 w-14 h-14 flex items-start justify-center">
                             <div className="w-10 h-10 rounded-full bg-blue-50 border-4 border-white ring-1 ring-blue-100 text-blue-500 flex items-center justify-center shadow-sm z-10 group-hover:scale-110 transition-transform">
                                <ChevronRight size={16} />
                            </div>
                        </div>
                         <div className="p-2 opacity-70 group-hover:opacity-100 transition-opacity">
                            <h4 className="text-sm font-bold text-blue-500 uppercase tracking-wide mb-2">Planificación</h4>
                            <ul className="space-y-1">
                                {data.urgencias_por_prioridad['semanas_2_3'].map((item, i) => (
                                    <li key={i} className="text-xs text-gray-500 italic leading-snug">
                                        - {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
           </div>
        </div>
      </div>
    </div>
  );
};
