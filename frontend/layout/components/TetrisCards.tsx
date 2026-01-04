import React, { useState } from 'react';
import { Brain, Cpu, Fingerprint, Target, Radar, Megaphone, ListTodo, Calendar, ArrowRight } from 'lucide-react';

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
    title: "Inteligencia de Mercado",
    description: "No somos una herramienta de Social Listening convencional. Pixely Partners aplica un diagnóstico continuo que va más allá de las métricas de vanidad (likes y alcance) para entender el porqué detrás de los datos, analizando la psicología y sociología de tu audiencia en tiempo real.",
    icon: <Brain className="w-8 h-8 md:w-10 md:h-10 text-primary-500" />,
    gridClass: "md:col-span-2 md:row-span-1",
    hoverClass: "md:group-hover:h-[calc(200%+1rem)]"
  },
  {
    id: 2,
    title: "Tecnología",
    description: "Nuestro cerebro digital procesa la conversación de tu marca a través de 10 módulos analíticos avanzados. Desde la Rueda de las Emociones de Plutchik hasta los Marcos Narrativos, utilizamos modelos científicos para decodificar la mente de tu consumidor con precisión.",
    icon: <Cpu className="w-8 h-8 md:w-10 md:h-10 text-blue-500" />,
    gridClass: "md:col-span-1 md:row-span-2",
    hoverClass: "md:group-hover:w-[calc(200%+1rem)]"
  },
  {
    id: 3,
    title: "Muéstrate",
    description: "¿Tu marca se percibe como crees? Comparamos tu identidad proyectada vs. la percibida usando el modelo de Personalidad de Marca de Aaker para corregir disonancias.",
    icon: <Fingerprint className="w-8 h-8 md:w-10 md:h-10 text-purple-500" />,
    gridClass: "md:col-span-1 md:row-span-1",
    hoverClass: "md:group-hover:h-[calc(200%+1rem)]"
  },
  {
    id: 4,
    title: "Acierta",
    description: "Elimina la subjetividad. Utiliza nuestro sistema para detectar necesidades no atendidas y tomar decisiones.",
    icon: <Target className="w-8 h-8 md:w-10 md:h-10 text-teal-500" />,
    gridClass: "md:col-span-1 md:row-span-1",
    hoverClass: "md:group-hover:w-[calc(200%+1rem)]"
  },
  {
    id: 5,
    title: "Anticipa",
    description: "Nuestro sistema de alertas tempranas identifica emociones negativas antes de que sean un problema",
    icon: <Radar className="w-8 h-8 md:w-10 md:h-10 text-indigo-500" />,
    gridClass: "md:col-span-1 md:row-span-1",
    hoverClass: "md:group-hover:w-[calc(200%+1rem)] md:group-hover:-ml-[calc(100%+1rem)]"
  },
  {
    id: 6,
    title: "Influye",
    description: "Identifica a los verdaderos líderes de opinión en tu nicho. Analizamos la centralidad y el engagement para encontrar quién mueve realmente la conversación.",
    icon: <Megaphone className="w-8 h-8 md:w-10 md:h-10 text-yellow-500" />,
    gridClass: "md:col-span-1 md:row-span-1",
    hoverClass: "md:group-hover:h-[calc(200%+1rem)] md:group-hover:-mt-[calc(100%+1rem)]"
  },
  {
    id: 7,
    title: "Tareas",
    description: "Transformamos la complejidad de la data en tareas simples. El sistema no solo entrega gráficos; sintetiza los hallazgos en tareas específicas, priorizados por urgencia e impacto, listos para ser ejecutados.",
    icon: <ListTodo className="w-8 h-8 md:w-10 md:h-10 text-cyan-500" />,
    gridClass: "md:col-span-2 md:row-span-1",
    hoverClass: "md:group-hover:w-[calc(200%+1rem)]"
  },
  {
    id: 8,
    title: "30 días",
    description: "Operamos bajo un ciclo de mejora continua dividido en 4 semanas estratégicas: Quick Wins para apagar fuegos, Alineación de identidad, Amplificación de alcance y Consolidación de resultados. Tu estrategia evoluciona mes a mes, nunca se estanca.",
    icon: <Calendar className="w-8 h-8 md:w-10 md:h-10 text-rose-500" />,
    gridClass: "md:col-span-2 md:row-span-1",
    hoverClass: "md:group-hover:w-[calc(200%+1rem)] md:group-hover:-ml-[calc(100%+1rem)]"
  }
];

const TetrisCards: React.FC = () => {
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full auto-rows-[220px] relative isolate">
      {cards.map((card) => {
        const isHovered = hoveredId === card.id;
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
            <div
              className={`
                absolute inset-0 
                bg-white rounded-[30px] shadow-sm border border-gray-100
                flex flex-col justify-between overflow-hidden
                transition-all duration-700 ease-[cubic-bezier(0.2,0,0.2,1)]
                cursor-pointer
                ${isHovered ? `shadow-2xl border-primary-100 ${card.hoverClass}` : ''}
                ${isBlurred ? 'blur-[2px] opacity-60 scale-[0.98] grayscale-[0.2]' : ''}
              `}
            >
               <div className="p-6 md:p-8 h-full flex flex-col relative z-20">
                  {/* Header Section */}
                  <div className="flex flex-col items-start space-y-4 mb-4">
                    <div className={`
                      p-3 rounded-2xl bg-gray-50 transition-all duration-500 
                      origin-left
                      ${isHovered ? 'bg-primary-50 scale-105' : ''}
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
                    <div className="flex items-center text-primary-600 font-bold text-sm">
                      <span>EXPLORE SOLUTION</span>
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </div>
                  </div>
               </div>

              {/* Background Decor - Only visible on hover */}
              <div className={`
                absolute -right-16 -bottom-16 w-64 h-64 bg-gradient-to-tl from-primary-100/60 to-transparent rounded-full blur-3xl 
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
