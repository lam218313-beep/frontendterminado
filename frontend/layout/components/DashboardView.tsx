import React from 'react';
import { useAnalysisContext } from '../hooks/useAnalysis';
import { 
  AlertTriangle, 
  FileText
} from 'lucide-react';

// Import Dashboard Components
import { CardLabsHeader } from './dashboard_cards/CardLabsHeader';
import { CardLabsQ1_Emotions } from './dashboard_cards/CardLabsQ1_Emotions';
import { CardLabsQ3_TopTopics } from './dashboard_cards/CardLabsQ3_TopTopics';
import { CardLabsQ6_OpportunitiesMatrix } from './dashboard_cards/CardLabsQ6_OpportunitiesMatrix';
import { CardLabsQ7_SentimentBars } from './dashboard_cards/CardLabsQ7_SentimentBars';
import { CardLabsQ8_TemporalEvolution } from './dashboard_cards/CardLabsQ8_TemporalEvolution';
import { CardLabsQ9_Prioritization } from './dashboard_cards/CardLabsQ9_Prioritization';
import { CardLabsQ10_ExecutiveSummary } from './dashboard_cards/CardLabsQ10_ExecutiveSummary';

export const DashboardView: React.FC = () => {
  const { data, isLoading, error } = useAnalysisContext();

  if (isLoading) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-brand-bg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Cargando análisis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-brand-bg">
        <div className="text-center text-red-500">
          <AlertTriangle size={48} className="mx-auto mb-4" />
          <p>Error: {error}</p>
        </div>
      </div>
    );
  }

  // Check if we have the minimum required data to render the dashboard
  if (!data.Q10 || !data.Q9 || !data.Q8 || !data.Q6 || !data.Q1 || !data.Q7 || !data.Q3) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-brand-bg">
        <div className="text-center text-gray-500">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>No hay datos de análisis completos disponibles. Ejecuta el análisis primero.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col p-4 md:p-8 animate-fade-in-up bg-brand-bg overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-6 w-full">
          
          <CardLabsHeader />

          {/* Grid Layout for exactly 8 Cards (4 double-width, 4 single-width) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* 1. Q10 Executive Summary (Double) */}
              <div className="lg:col-span-2 md:col-span-2">
                  <CardLabsQ10_ExecutiveSummary data={data.Q10.results as any} />
              </div>

              {/* 2. Q9 Prioritization Matrix (Double) */}
              <div className="lg:col-span-2 md:col-span-2">
                 <CardLabsQ9_Prioritization data={data.Q9.results as any} />
              </div>

              {/* 3. Q8 Time Evolution (Double) */}
              <div className="lg:col-span-2 md:col-span-2">
                  <CardLabsQ8_TemporalEvolution data={data.Q8 as any} />
              </div>

              {/* 4. Q6 Opportunity Matrix (Double) */}
              <div className="lg:col-span-2 md:col-span-2">
                  <CardLabsQ6_OpportunitiesMatrix data={data.Q6 as any} />
              </div>

              {/* 5. Q1 Spider Graph (Single) */}
              <div className="lg:col-span-1">
                  <CardLabsQ1_Emotions data={data.Q1 as any} />
              </div>
              
              {/* 6. Q7 Bar Chart (Single) */}
              <div className="lg:col-span-1">
                  <CardLabsQ7_SentimentBars data={data.Q7 as any} />
              </div>

               {/* 7 & 8. Q3 Top Topics (Renders 2 Single Cards) */}
               <div className="lg:col-span-2 md:col-span-2">
                  <div className="w-full h-full">
                       <CardLabsQ3_TopTopics data={data.Q3 as any} />
                  </div>
               </div>

          </div>
      </div>
    </div>
  );
};
