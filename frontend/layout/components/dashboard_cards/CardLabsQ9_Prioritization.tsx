import React, { useState, useRef, useMemo, useCallback } from 'react';
import { Target, ArrowUpRight, AlertCircle, CheckCircle2, MoreHorizontal } from 'lucide-react';

interface Recommendation {
  recomendacion: string;
  descripcion: string;
  area_estrategica: string;
  score_impacto: number;  // 0-100 (Y Axis)
  score_esfuerzo: number; // 0-100 (X Axis)
  prioridad: number;
  urgencia: 'CRÍTICA' | 'ALTA' | 'MEDIA' | 'BAJA';
}

interface CardLabsQ9_PrioritizationProps {
  data: {
    lista_recomendaciones: Recommendation[];
    insight: string;
  };
}

// Strict Palette
const GREEN = '#41ead4';
const YELLOW = '#f3dfa2';
const RED = '#ee4266';
const BLUE = '#63ADF2';

export const CardLabsQ9_Prioritization: React.FC<CardLabsQ9_PrioritizationProps> = ({ data }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [hoveredRec, setHoveredRec] = useState<string | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipped) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -3;
    const rotateY = ((x - centerX) / centerX) * 3;
    setRotation({ x: rotateX, y: rotateY });
  }, [isFlipped]);

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setHoveredRec(null);
  };

  const getBubbleColor = (impact: number, effort: number) => {
    // Logic: High Impact/Low Effort (Quick Win) -> Green
    // High Impact/High Effort (Strategic) -> Yellow
    // Low Impact/Low Effort (Filler) -> Blue
    // Low Impact/High Effort (Waste) -> Red
    if (impact > 50) return effort < 50 ? GREEN : YELLOW;
    return effort < 50 ? BLUE : RED;
  };

  const sortedRecs = useMemo(() => {
    return [...data.lista_recomendaciones].sort((a, b) => b.prioridad - a.prioridad);
  }, [data]);

  return (
    <div 
      className="relative w-full h-full min-h-[340px] [perspective:1000px] group cursor-pointer"
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
        {/* --- FRONT FACE: MATRIX SCATTER --- */}
        <div className="absolute inset-0 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 [backface-visibility:hidden] flex flex-col z-10">
          
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-primary-50 rounded-xl text-primary-500">
                <Target size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 leading-tight">Priorización</h3>
                <p className="text-xs text-gray-400 font-medium">Matriz de Impacto</p>
              </div>
            </div>
            <div className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-[10px] font-bold border border-primary-100">
                {data.lista_recomendaciones.length} Acciones
            </div>
          </div>

          <div className="flex-1 relative border border-gray-100 rounded-2xl bg-gray-50/50 overflow-hidden">
            {/* Quadrant Backgrounds */}
            <div className="absolute inset-0 flex flex-col">
                <div className="flex-1 flex">
                    {/* Q1: Quick Wins (High Impact, Low Effort) */}
                    <div className="flex-1 border-r border-b border-gray-100/50 relative bg-chart-green/5">
                        <span className="absolute top-2 left-2 text-[9px] font-bold text-chart-green uppercase tracking-wider opacity-60">Quick Wins</span>
                    </div>
                    {/* Q2: Strategic (High Impact, High Effort) */}
                    <div className="flex-1 border-b border-gray-100/50 relative bg-chart-yellow/5">
                        <span className="absolute top-2 right-2 text-[9px] font-bold text-chart-yellow uppercase tracking-wider opacity-60">Strategic</span>
                    </div>
                </div>
                <div className="flex-1 flex">
                    {/* Q3: Fillers (Low Impact, Low Effort) */}
                    <div className="flex-1 border-r border-gray-100/50 relative bg-chart-blue/5">
                        <span className="absolute bottom-2 left-2 text-[9px] font-bold text-chart-blue uppercase tracking-wider opacity-60">Low Hanging</span>
                    </div>
                    {/* Q4: Waste (Low Impact, High Effort) */}
                    <div className="flex-1 relative bg-chart-red/5">
                        <span className="absolute bottom-2 right-2 text-[9px] font-bold text-chart-red uppercase tracking-wider opacity-60">Time Wasters</span>
                    </div>
                </div>
            </div>

            {/* Axes Labels */}
            <span className="absolute bottom-1 w-full text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">Esfuerzo →</span>
            <span className="absolute left-1 top-1/2 -translate-y-1/2 -rotate-90 text-[9px] font-bold text-gray-400 uppercase tracking-widest origin-center">Impacto →</span>

            {/* Bubbles */}
            <div className="absolute inset-4">
                {data.lista_recomendaciones.map((rec, i) => {
                    const color = getBubbleColor(rec.score_impacto, rec.score_esfuerzo);
                    const isHovered = hoveredRec === rec.recomendacion;
                    const isDimmed = hoveredRec && hoveredRec !== rec.recomendacion;

                    return (
                        <div 
                            key={i}
                            className={`absolute w-8 h-8 rounded-full shadow-sm border-2 border-white flex items-center justify-center transition-all duration-300 cursor-pointer ${isHovered ? 'z-20 scale-125' : 'z-10 scale-100'} ${isDimmed ? 'opacity-20' : 'opacity-100'}`}
                            style={{ 
                                left: `${rec.score_esfuerzo}%`, 
                                bottom: `${rec.score_impacto}%`, 
                                backgroundColor: color,
                                transform: 'translate(-50%, 50%)'
                            }}
                            onMouseEnter={() => setHoveredRec(rec.recomendacion)}
                            onMouseLeave={() => setHoveredRec(null)}
                        >
                            <span className="text-[10px] font-bold text-gray-800 opacity-80">{i + 1}</span>
                            
                            {/* Tooltip */}
                            {isHovered && (
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-40 bg-gray-900 text-white p-2 rounded-lg shadow-xl pointer-events-none z-30">
                                    <p className="text-[10px] font-bold leading-tight mb-1">{rec.recomendacion}</p>
                                    <div className="flex justify-between text-[9px] text-gray-400">
                                        <span>Imp: {rec.score_impacto}</span>
                                        <span>Esf: {rec.score_esfuerzo}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
          </div>
          
          <div className="mt-3 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-chart-green"></div><span className="text-[10px] text-gray-500">Quick Wins</span>
            <div className="w-1.5 h-1.5 rounded-full bg-chart-yellow ml-2"></div><span className="text-[10px] text-gray-500">Strategic</span>
          </div>

        </div>

        {/* --- BACK FACE: LIST VIEW --- */}
        <div className="absolute inset-0 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col z-20">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-gray-800">Lista Priorizada</h3>
                <ArrowUpRight size={16} className="text-gray-400" />
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 space-y-3">
                {sortedRecs.map((rec, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3 border border-gray-100 hover:border-primary-100 hover:shadow-sm transition-all">
                        <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white border border-gray-200 text-[10px] font-bold text-gray-600">
                                    {i + 1}
                                </span>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                                    rec.urgencia === 'CRÍTICA' ? 'bg-chart-red/10 text-chart-red border-chart-red/20' : 
                                    rec.urgencia === 'ALTA' ? 'bg-chart-yellow/10 text-chart-yellow border-chart-yellow/20' : 
                                    'bg-chart-blue/10 text-chart-blue border-chart-blue/20'
                                }`}>
                                    {rec.urgencia}
                                </span>
                            </div>
                            <span className="text-[9px] text-gray-400 uppercase font-bold">{rec.area_estrategica}</span>
                        </div>
                        <h4 className="text-xs font-bold text-gray-800 leading-snug mb-1">{rec.recomendacion}</h4>
                        <p className="text-[10px] text-gray-500 line-clamp-2">{rec.descripcion}</p>
                    </div>
                ))}
            </div>
            
            <div className="mt-3 pt-3 border-t border-gray-50">
                <p className="text-[10px] text-gray-400 italic">
                    <span className="font-bold text-gray-600">Insight:</span> {data.insight}
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};
