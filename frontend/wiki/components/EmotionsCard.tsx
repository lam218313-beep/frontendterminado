import React from 'react';
import { Activity } from 'lucide-react';

export const EmotionsCard: React.FC = () => {
  return (
    <div className="bg-white rounded-[40px] p-10 shadow-sm border border-gray-100 flex flex-col justify-center h-full min-h-[320px] relative overflow-hidden group hover:shadow-md transition-shadow duration-300">
      
      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-500 border border-primary-100">
            <Activity size={28} />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            Análisis de Emociones
        </h2>
      </div>

      <p className="text-gray-500 leading-relaxed text-lg">
        Decodificación de sentimientos en tiempo real. Utilizamos procesamiento de lenguaje natural (NLP) para transformar opiniones cualitativas no estructuradas en métricas cuantitativas de satisfacción, identificando puntos de fricción críticos antes de que afecten el churn rate.
      </p>

      {/* Hover Effect Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2 group-hover:bg-primary-500/10 transition-colors"></div>
    </div>
  );
};