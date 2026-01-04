import React, { useState } from 'react';
import { BarChart3, Cloud, BrainCircuit, ShieldCheck, ArrowRight, Zap, Globe, Smartphone, Infinity as InfinityIcon } from 'lucide-react';

interface CardData {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  gridClass: string;
  hoverClass: string;
}

const cards: CardData[] = [
  {
    id: 1,
    title: "Predictive Analysis",
    description: "Forecast future trends with high accuracy using our proprietary models.",
    icon: <BarChart3 className="w-8 h-8 md:w-10 md:h-10 text-magenta-500" />,
    gridClass: "md:col-span-2 md:row-span-1",
    // Top Row: Safe to expand DOWN (Covers Row 2)
    hoverClass: "md:group-hover:h-[calc(200%+1rem)]"
  },
  {
    id: 2,
    title: "Cloud Infra",
    description: "Scalable, secure, and reliable cloud solutions designed to grow vertically.",
    icon: <Cloud className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />,
    gridClass: "md:col-span-1 md:row-span-2",
    // Middle Column (Col 3): Expand RIGHT (Covers NLP Core & Real-time Analytics)
    hoverClass: "md:group-hover:w-[calc(200%+1rem)]"
  },
  {
    id: 3,
    title: "NLP Core",
    description: "Advanced pipelines to interpret human language.",
    icon: <BrainCircuit className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />,
    gridClass: "md:col-span-1 md:row-span-1",
    // Top Right (Col 4, Row 1): Expands DOWN (Covers Real-time Analytics)
    // Vertical arrows in screenshot indicate vertical axis. Down is the only safe direction.
    hoverClass: "md:group-hover:h-[calc(200%+1rem)]"
  },
  {
    id: 4,
    title: "Data Security",
    description: "Enterprise-grade encryption and compliance frameworks.",
    icon: <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-teal-500" />,
    gridClass: "md:col-span-1 md:row-span-1",
    // Left Edge (Col 1, Row 2): Expands RIGHT (Covers DevOps)
    // Horizontal arrows in screenshot indicate horizontal axis. Right is the only safe direction.
    hoverClass: "md:group-hover:w-[calc(200%+1rem)]"
  },
  {
    id: 5,
    title: "DevOps",
    description: "Streamline deployment with CI/CD integration.",
    icon: <InfinityIcon className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />,
    gridClass: "md:col-span-1 md:row-span-1",
    // Inner Left (Col 2, Row 2): Expands LEFT (Covers Data Security)
    hoverClass: "md:group-hover:w-[calc(200%+1rem)] md:group-hover:-ml-[calc(100%+1rem)]"
  },
  {
    id: 6,
    title: "Real-time Analytics",
    description: "Monitor your data streams in real-time with zero latency.",
    icon: <Zap className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" />,
    gridClass: "md:col-span-1 md:row-span-1",
    // Right Edge (Col 4, Row 2): Expands UP (Covers NLP Core)
    hoverClass: "md:group-hover:h-[calc(200%+1rem)] md:group-hover:-mt-[calc(100%+1rem)]"
  },
  {
    id: 7,
    title: "Global CDN",
    description: "Deliver content faster to users anywhere in the world.",
    icon: <Globe className="w-8 h-8 md:w-10 md:h-10 text-cyan-500" />,
    gridClass: "md:col-span-2 md:row-span-1",
    // Bottom Left (Col 1-2, Row 3): Expands RIGHT (Covers Mobile SDK)
    // Matches screenshot arrows pointing Right.
    hoverClass: "md:group-hover:w-[calc(200%+1rem)]"
  },
  {
    id: 8,
    title: "Mobile SDK",
    description: "Native integrations for iOS and Android platforms.",
    icon: <Smartphone className="w-8 h-8 md:w-10 md:h-10 text-rose-500" />,
    gridClass: "md:col-span-2 md:row-span-1",
    // Bottom Right (Col 3-4, Row 3): Expands LEFT (Covers Global CDN)
    hoverClass: "md:group-hover:w-[calc(200%+1rem)] md:group-hover:-ml-[calc(100%+1rem)]"
  }
];

const TetrisCards: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    // 'isolate' creates a new stacking context, helping contain z-index wars.
    // 'relative' ensures children position correctly.
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full auto-rows-[220px] relative isolate">
      {cards.map((card) => {
        const isHovered = hoveredId === card.id;
        // Blur everything else when one is hovered
        const isBlurred = hoveredId !== null && hoveredId !== card.id;

        return (
          <div
            key={card.id}
            className={`
              relative group 
              ${card.gridClass}
              ${isHovered ? 'z-50' : 'z-0'}
            `}
            onMouseEnter={() => setHoveredId(card.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            {/* 
              The Card Inner
              - absolute inset-0: Fills the grid cell initially.
              - transitions: Slowed to 700ms and eased for a 'premium' feel (no dizziness).
              - isBlurred: Applies blur, scale down, and opacity drop to background cards.
            */}
            <div
              className={`
                absolute inset-0 
                bg-white rounded-[30px] shadow-sm border border-gray-100
                flex flex-col justify-between overflow-hidden
                transition-all duration-700 ease-[cubic-bezier(0.2,0,0.2,1)]
                cursor-pointer
                ${isHovered ? `shadow-2xl border-magenta-100 ${card.hoverClass}` : ''}
                ${isBlurred ? 'blur-[2px] opacity-60 scale-[0.98] grayscale-[0.2]' : ''}
              `}
            >
               <div className="p-6 md:p-8 h-full flex flex-col relative z-20">
                  {/* Header Section */}
                  <div className="flex flex-col items-start space-y-4 mb-4">
                    <div className={`
                      p-3 rounded-2xl bg-gray-50 transition-all duration-500 
                      origin-left
                      ${isHovered ? 'bg-magenta-50 scale-105' : ''}
                    `}>
                      {card.icon}
                    </div>
                    <h3 className={`
                      text-xl md:text-2xl font-bold text-gray-900 leading-tight transition-transform duration-500
                      ${isHovered ? 'translate-y-0' : ''}
                    `}>
                      {card.title}
                    </h3>
                  </div>

                  {/* Content Section - Revealed nicely on expand */}
                  <div className={`
                    mt-auto flex flex-col space-y-4 transition-all duration-700 delay-100
                    ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                  `}>
                    <p className="text-gray-600 text-base leading-relaxed">
                      {card.description}
                    </p>
                    <div className="flex items-center text-magenta-600 font-bold text-sm">
                      <span>EXPLORE SOLUTION</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </div>
                  </div>
               </div>

              {/* Background Decor - Only visible on hover */}
              <div className={`
                absolute -right-16 -bottom-16 w-64 h-64 bg-gradient-to-tl from-magenta-100/60 to-transparent rounded-full blur-3xl 
                transition-opacity duration-700 pointer-events-none z-10
                ${isHovered ? 'opacity-100' : 'opacity-0'}
              `}></div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TetrisCards;