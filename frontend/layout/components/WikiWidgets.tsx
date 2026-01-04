import React from 'react';
import { Users, BarChart3, Target, Search, Layers, TrendingUp, Map, CheckCircle2, AlertCircle, Brain, MessageSquare, Star, Zap, Fingerprint, Megaphone, Radar } from 'lucide-react';

// --- Color Palette ---
const CHART = {
  yellow: '#f3dfa2',
  green: '#41ead4',
  red: '#ee4266',
  blue: '#63ADF2',
  primary: '#0ea5e9'
};

// --- Shared Components ---

const GridBackground = () => (
  <div className="absolute inset-0 pointer-events-none opacity-30" 
    style={{ 
        backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)', 
        backgroundSize: '30px 30px' 
    }}>
  </div>
);

const TextCard: React.FC<{ 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode 
}> = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-[40px] p-10 shadow-lg border border-gray-50 flex flex-col justify-center h-full min-h-[340px] group hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up relative overflow-hidden">
    {/* Subtle gradient background blob */}
    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity"></div>
    
    <div className="flex items-center gap-4 mb-6 relative z-10">
      <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary-500 border border-primary-50 group-hover:scale-110 transition-transform duration-300">
          <Icon size={32} className="drop-shadow-sm" />
      </div>
      <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none">
          {title}
      </h2>
    </div>
    <div className="text-gray-500 leading-relaxed text-lg font-medium relative z-10">
      {children}
    </div>
  </div>
);

const VisualCard: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="bg-white rounded-[40px] p-8 shadow-lg border border-gray-50 h-full min-h-[340px] relative overflow-hidden flex items-center justify-center group hover:shadow-xl transition-all duration-300 animate-fade-in-up">
    <GridBackground />
    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_40px_rgba(0,0,0,0.02)] rounded-[40px]"></div>
    <div className="relative z-10 w-full h-full flex items-center justify-center">
      {children}
    </div>
  </div>
);

// --- Q2: Personalidad de Marca (Aaker) ---

export const BrandPersonalityCard = () => (
  <TextCard title="Personalidad de Marca" icon={Fingerprint}>
    <p>Evaluamos cómo es percibida tu marca utilizando las 5 dimensiones de Aaker: Sinceridad, Emoción, Competencia, Sofisticación y Robustez. Analizamos los comentarios de la audiencia para determinar si la identidad proyectada coincide con la percepción real.</p>
  </TextCard>
);

export const BrandPersonalityVisual = () => (
  <VisualCard>
    <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Polar Area Chart */}
        <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible drop-shadow-xl animate-fade-in-up">
            <circle cx="100" cy="100" r="30" fill="none" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="2 2" />
            <circle cx="100" cy="100" r="90" fill="none" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="2 2" />

            {/* Sinceridad */}
            <path d="M 100 100 L 100 20 A 80 80 0 0 1 176 75 Z" fill={CHART.green} className="opacity-90 hover:opacity-100 hover:scale-105 transition-all origin-center" />
            {/* Emoción */}
            <path d="M 100 100 L 176 75 A 80 80 0 0 1 147 164 Z" fill={CHART.blue} className="opacity-80 hover:opacity-100 hover:scale-105 transition-all origin-center" />
            {/* Competencia */}
            <path d="M 100 100 L 147 164 A 80 80 0 0 1 53 164 Z" fill={CHART.primary} className="opacity-70 hover:opacity-100 hover:scale-105 transition-all origin-center" />
            {/* Sofisticación */}
            <path d="M 100 100 L 53 164 A 80 80 0 0 1 24 75 Z" fill={CHART.yellow} className="opacity-85 hover:opacity-100 hover:scale-105 transition-all origin-center" />
            {/* Robustez */}
            <path d="M 100 100 L 24 75 A 80 80 0 0 1 100 20 Z" fill={CHART.red} className="opacity-75 hover:opacity-100 hover:scale-105 transition-all origin-center" />

            <circle cx="100" cy="100" r="15" fill="white" className="shadow-sm" />
        </svg>

        {/* Labels */}
        <div className="absolute top-0 right-10 text-[10px] font-bold text-gray-600 bg-white/90 px-2 py-1 rounded shadow-sm">Sinceridad</div>
        <div className="absolute bottom-10 right-0 text-[10px] font-bold text-gray-600 bg-white/90 px-2 py-1 rounded shadow-sm">Emoción</div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-600 bg-white/90 px-2 py-1 rounded shadow-sm">Competencia</div>
        <div className="absolute bottom-10 left-0 text-[10px] font-bold text-gray-600 bg-white/90 px-2 py-1 rounded shadow-sm">Sofisticación</div>
        <div className="absolute top-0 left-10 text-[10px] font-bold text-gray-600 bg-white/90 px-2 py-1 rounded shadow-sm">Robustez</div>
    </div>
  </VisualCard>
);

// --- Q3: Análisis de Tópicos ---

export const TopicsAnalysisCard = () => (
  <TextCard title="Análisis de Tópicos" icon={BarChart3}>
    <p>Identificamos los temas principales de conversación y su sentimiento asociado. Clasificamos los tópicos en una matriz de volumen vs. sentimiento para detectar oportunidades de alto impacto y riesgos potenciales.</p>
  </TextCard>
);

export const TopicsAnalysisVisual = () => (
  <VisualCard>
    <div className="relative w-full h-64 border-l-2 border-b-2 border-gray-200 m-4">
       <div className="absolute -left-6 top-1/2 -rotate-90 text-[10px] font-bold text-gray-400 uppercase tracking-widest origin-center whitespace-nowrap">Volumen →</div>
       <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Sentimiento →</div>

       <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-chart-green/5 border-l border-b border-dashed border-gray-200 flex items-center justify-center">
          <span className="text-chart-green font-bold text-xs opacity-30">Oportunidad</span>
       </div>
       <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-chart-red/5 border-t border-r border-dashed border-gray-200 flex items-center justify-center">
          <span className="text-chart-red font-bold text-xs opacity-30">Riesgo</span>
       </div>

       {[
         { x: '80%', y: '20%', r: 24, c: CHART.green, label: 'Calidad' },
         { x: '20%', y: '80%', r: 16, c: CHART.red, label: 'Precio' },
         { x: '70%', y: '70%', r: 20, c: CHART.yellow, label: 'Servicio' },
         { x: '30%', y: '30%', r: 14, c: CHART.blue, label: 'Soporte' },
         { x: '50%', y: '50%', r: 18, c: CHART.blue, label: 'UX' }
       ].map((b, i) => (
          <div key={i} className="absolute rounded-full flex items-center justify-center shadow-md animate-float"
            style={{ left: b.x, top: b.y, width: b.r * 2, height: b.r * 2, backgroundColor: b.c, transform: 'translate(-50%, -50%)', animationDelay: `${i * 0.5}s` }}>
             <span className="text-[10px] font-bold text-white drop-shadow-sm">{b.label}</span>
          </div>
       ))}
    </div>
  </VisualCard>
);

// --- Q4: Marcos Narrativos (Entman) ---

export const NarrativeFramesCard = () => (
  <TextCard title="Marcos Narrativos" icon={Layers}>
    <p>Descodificamos cómo la audiencia encuadra la conversación sobre tu marca. Identificamos si predominan narrativas de Conflicto, Interés Humano, Consecuencias Económicas, Moralidad o Responsabilidad.</p>
  </TextCard>
);

export const NarrativeFramesVisual = () => (
  <VisualCard>
     <div className="w-full max-w-sm flex flex-col gap-3">
        {[
            { label: 'Interés Humano', status: 'Dominante', color: CHART.green, icon: Users },
            { label: 'Conflicto', status: 'Alto', color: CHART.yellow, icon: AlertCircle },
            { label: 'Económico', status: 'Medio', color: CHART.blue, icon: TrendingUp },
            { label: 'Responsabilidad', status: 'Bajo', color: CHART.primary, icon: CheckCircle2 },
        ].map((item, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md hover:bg-white transition-all duration-300">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-white shadow-sm" style={{ color: item.color }}>
                        <item.icon size={20} />
                    </div>
                    <span className="font-bold text-gray-700 text-sm">{item.label}</span>
                </div>
                <div className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white border" style={{ color: item.color, borderColor: item.color }}>
                    {item.status}
                </div>
            </div>
        ))}
     </div>
  </VisualCard>
);

// --- Q5: Voces Influyentes ---

export const InfluencersCard = () => (
  <TextCard title="Voces Influyentes" icon={Megaphone}>
    <p>Identificamos a los participantes más destacados en la conversación, no por número de seguidores, sino por su capacidad de generar engagement y autoridad en la discusión. Clasificamos su influencia en: Frecuente, Autoridad o Viral.</p>
  </TextCard>
);

export const InfluencersVisual = () => (
  <VisualCard>
    <div className="flex flex-col gap-4 w-full max-w-xs">
        {[
            { user: '@TechGuru', type: 'Autoridad', score: 98, color: CHART.primary },
            { user: '@EarlyAdopter', type: 'Viral', score: 85, color: CHART.green },
            { user: '@SuperFan', type: 'Frecuente', score: 72, color: CHART.yellow },
        ].map((inf, i) => (
            <div key={i} className="flex items-center gap-4 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: inf.color }}>
                    {inf.user[1]}
                </div>
                <div className="flex-1">
                    <div className="font-bold text-gray-800">{inf.user}</div>
                    <div className="text-xs text-gray-500">{inf.type}</div>
                </div>
                <div className="text-lg font-bold" style={{ color: inf.color }}>{inf.score}</div>
            </div>
        ))}
    </div>
  </VisualCard>
);

// --- Q6: Matriz de Oportunidades ---

export const OpportunitiesCard = () => (
  <TextCard title="Matriz de Oportunidades" icon={Star}>
    <p>Sintetizamos los hallazgos en acciones estratégicas priorizadas. Cruzamos el impacto potencial con el esfuerzo requerido para generar una hoja de ruta clara: Quick Wins, Proyectos Mayores y Tareas de Mantenimiento.</p>
  </TextCard>
);

export const OpportunitiesVisual = () => (
  <VisualCard>
     <div className="relative w-48 h-48 flex items-center justify-center [perspective:800px]">
        <div className="relative w-32 h-32 [transform-style:preserve-3d] [transform:rotateX(60deg)_rotateZ(45deg)] group-hover:[transform:rotateX(50deg)_rotateZ(45deg)_translateZ(20px)] transition-transform duration-500">
            {/* Mantenimiento */}
            <div className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-200 flex items-center justify-center [transform:translateZ(0px)]">
                <span className="text-[10px] font-bold text-gray-400 -rotate-45">Mantenimiento</span>
            </div>
            {/* Proyectos */}
            <div className="absolute inset-0 bg-primary-50 rounded-2xl shadow-xl border border-primary-100 flex items-center justify-center [transform:translateZ(40px)]">
                <span className="text-[10px] font-bold text-primary-600 -rotate-45">Proyectos</span>
            </div>
            {/* Quick Wins */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl shadow-2xl border border-primary-400 flex items-center justify-center [transform:translateZ(80px)]">
                <span className="text-xs font-bold text-white -rotate-45">Quick Wins</span>
            </div>
        </div>
     </div>
  </VisualCard>
);

// --- Q7: Análisis de Sentimiento ---

export const SentimentAnalysisCard = () => (
  <TextCard title="Análisis de Sentimiento" icon={Target}>
    <p>Medimos la polaridad emocional de la conversación (Positiva, Negativa, Neutra o Mixta). Vamos más allá del promedio para entender la distribución y la intensidad de los sentimientos expresados.</p>
  </TextCard>
);

export const SentimentAnalysisVisual = () => (
  <VisualCard>
    <div className="relative w-72 h-40 mt-10">
      <svg viewBox="0 0 240 140" className="w-full h-full overflow-visible">
         <defs>
           <linearGradient id="gaugeMain" x1="0" y1="0" x2="1" y2="0">
             <stop offset="0%" stopColor={CHART.red} />
             <stop offset="50%" stopColor={CHART.yellow} />
             <stop offset="100%" stopColor={CHART.green} />
           </linearGradient>
           <filter id="glowGauge">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
           </filter>
         </defs>
         <path d="M 30 120 A 90 90 0 0 1 210 120" fill="none" stroke="url(#gaugeMain)" strokeWidth="12" strokeLinecap="round" filter="url(#glowGauge)" />
         <circle cx="120" cy="120" r="10" fill="#1f2937" className="drop-shadow-lg" />
         <g className="origin-[120px_120px] animate-needle-sweep drop-shadow-md">
             <path d="M 120 120 L 120 35 L 116 120 Z" fill="#1f2937" />
             <circle cx="120" cy="35" r="5" fill={CHART.primary} stroke="white" strokeWidth="2" />
         </g>
         <text x="30" y="140" className="text-xs font-bold fill-gray-400">Negativo</text>
         <text x="210" y="140" className="text-xs font-bold fill-gray-400" textAnchor="end">Positivo</text>
      </svg>
    </div>
  </VisualCard>
);

// --- Q8: Evolución Temporal ---

export const TimeEvolutionCard = () => (
  <TextCard title="Evolución Temporal" icon={Map}>
    <p>Analizamos cómo cambian las emociones y los temas a lo largo del tiempo. Detectamos picos de actividad, tendencias emergentes y la ciclicidad de la conversación.</p>
  </TextCard>
);

export const TimeEvolutionVisual = () => (
  <VisualCard>
     <div className="w-full h-40 relative flex items-center justify-center">
        <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
           <path d="M 20 60 Q 90 10 150 60 T 280 60" fill="none" stroke="#e5e7eb" strokeWidth="4" strokeDasharray="8 8" />
           <path d="M 20 60 Q 90 10 150 60 T 280 60" fill="none" stroke={CHART.primary} strokeWidth="2" strokeDasharray="1000" strokeDashoffset="0" className="animate-draw-path" />
           {[
             { x: 20, y: 60, c: CHART.green, label: 'Inicio' },
             { x: 150, y: 60, c: CHART.blue, label: 'Desarrollo' },
             { x: 280, y: 60, c: CHART.yellow, label: 'Actual' }
           ].map((node, i) => (
             <g key={i}>
                 <foreignObject x={node.x - 30} y={node.y - 50} width="60" height="40">
                    <div className="flex items-center justify-center h-full">
                       <div className="bg-white border border-gray-100 shadow-md rounded-lg px-2 py-1 text-xs font-bold text-gray-600 animate-float" style={{ animationDelay: `${i}s` }}>{node.label}</div>
                    </div>
                 </foreignObject>
                 <circle cx={node.x} cy={node.y} r="8" fill="white" stroke={node.c} strokeWidth="3" />
             </g>
           ))}
        </svg>
     </div>
  </VisualCard>
);
