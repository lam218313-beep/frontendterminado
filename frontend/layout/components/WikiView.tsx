import React from 'react';
import WikiHero from './WikiHero';
import { WikiEmotionsCard } from './WikiEmotionsCard';
import { WikiTrendChart } from './WikiTrendChart';
import { 
  BrandPersonalityCard, BrandPersonalityVisual,
  TopicsAnalysisCard, TopicsAnalysisVisual,
  NarrativeFramesCard, NarrativeFramesVisual,
  InfluencersCard, InfluencersVisual,
  OpportunitiesCard, OpportunitiesVisual,
  SentimentAnalysisCard, SentimentAnalysisVisual,
  TimeEvolutionCard, TimeEvolutionVisual
} from './WikiWidgets';

const WikiView: React.FC = () => {
  return (
    <div className="col-span-12 space-y-6 bg-brand-bg">
      
      {/* Row 1: Hero Section */}
      <WikiHero />

      {/* Row 2: Q1 - Emociones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <WikiEmotionsCard />
         <WikiTrendChart />
      </div>

      {/* Row 3: Q2 - Personalidad de Marca */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <BrandPersonalityVisual />
         <BrandPersonalityCard />
      </div>

      {/* Row 4: Q3 - Análisis de Tópicos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <TopicsAnalysisCard />
         <TopicsAnalysisVisual />
      </div>

      {/* Row 5: Q4 - Marcos Narrativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <NarrativeFramesVisual />
         <NarrativeFramesCard />
      </div>

      {/* Row 6: Q5 - Voces Influyentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <InfluencersCard />
         <InfluencersVisual />
      </div>

      {/* Row 7: Q6 - Matriz de Oportunidades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <OpportunitiesVisual />
         <OpportunitiesCard />
      </div>

      {/* Row 8: Q7 - Análisis de Sentimiento */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <SentimentAnalysisCard />
         <SentimentAnalysisVisual />
      </div>

      {/* Row 9: Q8 - Evolución Temporal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <TimeEvolutionVisual />
         <TimeEvolutionCard />
      </div>

    </div>
  );
};

export default WikiView;
