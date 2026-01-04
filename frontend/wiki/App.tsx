import React from 'react';
import WikiHero from './components/WikiHero';
import { EmotionsCard } from './components/EmotionsCard';
import { TrendChartCard } from './components/TrendChartCard';
import { 
  ArchetypesCard, ArchetypesVisual,
  TopicsCard, TopicsVisual,
  CompetitiveCard, CompetitiveVisual,
  ChannelsCard, ChannelsVisual,
  ContentStratCard, ContentStratVisual,
  ConversionCard, ConversionVisual,
  RoadmapCard, RoadmapVisual
} from './components/DashboardWidgets';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg font-sans text-gray-900 flex items-center justify-center p-4 md:p-8">
      <main className="w-full max-w-7xl mx-auto space-y-6">
        
        {/* Row 1: Hero Section */}
        <WikiHero />

        {/* Row 2: Emotions (Existing) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[380px]">
           <div className="h-full">
              <EmotionsCard />
           </div>
           <div className="h-full">
              <TrendChartCard />
           </div>
        </div>

        {/* Row 3: Archetypes (New) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[380px]">
           <div className="h-full order-1 lg:order-1">
              <ArchetypesVisual />
           </div>
           <div className="h-full order-2 lg:order-2">
              <ArchetypesCard />
           </div>
        </div>

        {/* Row 4: Topics (New) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[380px]">
           <div className="h-full">
              <TopicsCard />
           </div>
           <div className="h-full">
              <TopicsVisual />
           </div>
        </div>

        {/* Row 5: Competitive (New) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[380px]">
           <div className="h-full">
              <CompetitiveVisual />
           </div>
           <div className="h-full">
              <CompetitiveCard />
           </div>
        </div>

        {/* Row 6: Channels (New) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[380px]">
           <div className="h-full">
              <ChannelsCard />
           </div>
           <div className="h-full">
              <ChannelsVisual />
           </div>
        </div>

        {/* Row 7: Content Strategy (New) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[380px]">
           <div className="h-full">
              <ContentStratVisual />
           </div>
           <div className="h-full">
              <ContentStratCard />
           </div>
        </div>

        {/* Row 8: Conversion (New) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[380px]">
           <div className="h-full">
              <ConversionCard />
           </div>
           <div className="h-full">
              <ConversionVisual />
           </div>
        </div>

        {/* Row 9: Roadmap (New) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-auto lg:h-[380px]">
           <div className="h-full">
              <RoadmapVisual />
           </div>
           <div className="h-full">
              <RoadmapCard />
           </div>
        </div>

      </main>
    </div>
  );
};

export default App;