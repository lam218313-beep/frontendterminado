import React, { useState } from 'react';
import { Lightbulb, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export const Card_Recommendations: React.FC = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  const recommendations = [
    { id: 1, text: "Optimizar campaña 'Verano' (ROI bajo)", impact: 'Alta' },
    { id: 2, text: "Aumentar frecuencia de posts en IG", impact: 'Media' },
    { id: 3, text: "Revisar palabras clave negativas", impact: 'Media' },
    { id: 4, text: "Actualizar creativos de Display", impact: 'Baja' },
  ];

  return (
    <div 
        className="relative w-full h-full min-h-[300px] [perspective:1000px] group cursor-pointer"
        onClick={() => setIsFlipped(!isFlipped)}
    >
        <div className={`w-full h-full relative transition-all duration-500 ease-out [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
            
            {/* FRONT */}
            <div className="absolute inset-0 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col [backface-visibility:hidden]">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-yellow-50 rounded-xl text-yellow-600">
                            <Lightbulb size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">Recomendaciones</h3>
                            <p className="text-xs text-gray-400 font-medium">IA Insights</p>
                        </div>
                    </div>
                    <div className="bg-yellow-50 text-yellow-600 text-[10px] font-bold px-2 py-1 rounded-full border border-yellow-100">
                        {recommendations.length} Activas
                    </div>
                </div>

                <div className="flex-1 space-y-3">
                    {recommendations.slice(0, 3).map((rec) => (
                        <div key={rec.id} className="group/item flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all">
                            <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${
                                rec.impact === 'Alta' ? 'bg-red-500' : 
                                rec.impact === 'Media' ? 'bg-yellow-500' : 'bg-blue-500'
                            }`}></div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-gray-700 leading-snug group-hover/item:text-gray-900">{rec.text}</p>
                            </div>
                            <ArrowRight size={14} className="text-gray-300 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                        </div>
                    ))}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-50 text-center">
                    <span className="text-xs font-bold text-gray-400">Ver todas las sugerencias</span>
                </div>
            </div>

            {/* BACK */}
            <div className="absolute inset-0 bg-yellow-50 rounded-[32px] p-6 shadow-sm border border-yellow-100 flex flex-col items-center justify-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div className="mb-4 bg-white p-4 rounded-full shadow-sm">
                    <Sparkles size={32} className="text-yellow-500 fill-yellow-500" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Impacto Potencial</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Aplicar estas mejoras podría incrementar tu conversión un <span className="font-bold text-gray-900">12%</span> esta semana.
                </p>
                <button className="bg-yellow-500 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-lg shadow-yellow-500/20 hover:bg-yellow-600 transition-colors">
                    Aplicar Todo
                </button>
            </div>
        </div>
    </div>
  );
};