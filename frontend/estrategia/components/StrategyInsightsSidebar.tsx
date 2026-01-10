
import React from 'react';
import { useAnalysisContext } from '../../layout/hooks/useAnalysis';
import { Lightbulb, TrendingUp, AlertTriangle } from 'lucide-react';

interface StrategyInsightsSidebarProps {
    onDragStart: (e: React.DragEvent, type: string, text: string) => void;
}

export const StrategyInsightsSidebar: React.FC<StrategyInsightsSidebarProps> = ({ onDragStart }) => {
    const { data, isLoading } = useAnalysisContext();

    if (isLoading) {
        return <div className="p-4 text-center text-gray-400">Cargando Insights...</div>;
    }

    // Prepare draggable items from Analysis Data

    // Q6: Opportunities
    const opportunities = data?.Q6?.results?.oportunidades || [];

    // Q9: Recommendations
    const recommendations = data?.Q9?.results?.lista_recomendaciones || [];

    return (
        <div className="w-80 border-l border-gray-100 bg-white h-full overflow-y-auto custom-scrollbar flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                    <Lightbulb size={18} className="text-yellow-500" />
                    Insights del Lab
                </h3>
                <p className="text-xs text-gray-500 mt-1">Arrastra estos elementos al mapa</p>
            </div>

            <div className="p-4 space-y-6">

                {/* OPPORTUNITIES */}
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <TrendingUp size={14} /> Oportunidades
                    </h4>
                    <div className="space-y-3">
                        {opportunities.map((op, idx) => (
                            <div
                                key={`op-${idx}`}
                                draggable
                                onDragStart={(e) => onDragStart(e, 'objective', op.oportunidad)}
                                className="p-3 bg-white border border-dashed border-primary-200 rounded-xl cursor-grab active:cursor-grabbing hover:border-primary-500 hover:shadow-md transition-all group"
                            >
                                <p className="text-sm font-medium text-gray-700 group-hover:text-primary-700">{op.oportunidad}</p>
                                <span className="text-[10px] text-gray-400 mt-2 block">{op.recomendacion_accion}</span>
                            </div>
                        ))}
                        {opportunities.length === 0 && <p className="text-xs text-gray-400 italic">No hay oportunidades detectadas.</p>}
                    </div>
                </div>

                {/* RECOMMENDATIONS */}
                <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <AlertTriangle size={14} /> Recomendaciones
                    </h4>
                    <div className="space-y-3">
                        {recommendations.map((rec, idx) => (
                            <div
                                key={`rec-${idx}`}
                                draggable
                                onDragStart={(e) => onDragStart(e, 'strategy', rec.recomendacion)}
                                className="p-3 bg-white border border-dashed border-orange-200 rounded-xl cursor-grab active:cursor-grabbing hover:border-orange-500 hover:shadow-md transition-all group"
                            >
                                <p className="text-sm font-medium text-gray-700 group-hover:text-orange-700">{rec.recomendacion}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500">{rec.area_estrategica}</span>
                                    {rec.prioridad === 1 && <span className="text-[10px] text-red-500 font-bold">Alta Prioridad</span>}
                                </div>
                            </div>
                        ))}
                        {recommendations.length === 0 && <p className="text-xs text-gray-400 italic">No hay recomendaciones.</p>}
                    </div>
                </div>

            </div>
        </div>
    );
};
