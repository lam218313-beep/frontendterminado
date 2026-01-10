import React from 'react';
import { Users, BarChart3, Target, Search, Layers, TrendingUp, Map, CheckCircle2, Circle, AlertCircle } from 'lucide-react';

// --- Color Palette ---
const CHART = {
  yellow: '#f3dfa2',
  green: '#41ead4',
  red: '#ee4266',
  blue: '#63ADF2',
  magenta: '#F20F79'
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

// --- Row 2: Archetypes (POLAR AREA / ROSE CHART) ---

export const ArchetypesCard = () => (
  <TextCard title="Arquetipos de Usuario" icon={Users}>
    <p>Segmentación multidimensional. Visualizamos el equilibrio entre innovación, lealtad, gasto y promoción. Este gráfico polar revela la magnitud relativa de cada perfil en su base de usuarios.</p>
  </TextCard>
);

export const ArchetypesVisual = () => (
  <VisualCard>
    <div className="relative w-72 h-72 flex items-center justify-center">
      {/* Polar Area Chart */}
      <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible drop-shadow-xl animate-fade-in-up">
        {/* Background Circles for reference */}
        <circle cx="100" cy="100" r="30" fill="none" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="100" cy="100" r="60" fill="none" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="100" cy="100" r="90" fill="none" stroke="#f3f4f6" strokeWidth="1" strokeDasharray="2 2" />

        {/* Wedge 1: -90 to 0 (Top Right) - Innovators (85%) */}
        <path
          d="M 100 100 L 100 20 A 80 80 0 0 1 180 100 Z"
          fill={CHART.green}
          className="opacity-90 hover:opacity-100 hover:scale-110 transition-all duration-300 origin-center cursor-pointer drop-shadow-sm"
          style={{ transformBox: 'fill-box' }}
        />

        {/* Wedge 2: 0 to 90 (Bottom Right) - Loyalists (65%) */}
        <path
          d="M 100 100 L 160 100 A 60 60 0 0 1 100 160 Z"
          fill={CHART.blue}
          className="opacity-80 hover:opacity-100 hover:scale-110 transition-all duration-300 origin-center cursor-pointer drop-shadow-sm"
          style={{ transformBox: 'fill-box' }}
        />

        {/* Wedge 3: 90 to 180 (Bottom Left) - Spenders (45%) */}
        <path
          d="M 100 100 L 100 145 A 45 45 0 0 1 55 100 Z"
          fill={CHART.magenta}
          className="opacity-70 hover:opacity-100 hover:scale-110 transition-all duration-300 origin-center cursor-pointer drop-shadow-sm"
          style={{ transformBox: 'fill-box' }}
        />

        {/* Wedge 4: 180 to 270 (Top Left) - Promoters (75%) */}
        <path
          d="M 100 100 L 30 100 A 70 70 0 0 1 100 30 Z"
          fill={CHART.yellow}
          className="opacity-85 hover:opacity-100 hover:scale-110 transition-all duration-300 origin-center cursor-pointer drop-shadow-sm"
          style={{ transformBox: 'fill-box' }}
        />

        {/* Central White Circle for Donut effect */}
        <circle cx="100" cy="100" r="15" fill="white" className="shadow-sm" />
        <circle cx="100" cy="100" r="6" fill={CHART.magenta} className="opacity-20" />
      </svg>

      {/* Floating Labels with connecting lines simulation */}
      <div className="absolute top-2 right-0 text-[10px] font-bold text-gray-600 bg-white/90 px-2 py-1 rounded shadow-sm border border-gray-100 animate-float" style={{ animationDelay: '0s' }}>
        <span className="text-chart-green">●</span> Innovadores
      </div>
      <div className="absolute bottom-8 right-0 text-[10px] font-bold text-gray-600 bg-white/90 px-2 py-1 rounded shadow-sm border border-gray-100 animate-float" style={{ animationDelay: '0.5s' }}>
        <span className="text-chart-blue">●</span> Leales
      </div>
      <div className="absolute bottom-2 left-0 text-[10px] font-bold text-gray-600 bg-white/90 px-2 py-1 rounded shadow-sm border border-gray-100 animate-float" style={{ animationDelay: '1s' }}>
        <span className="text-chart-magenta">●</span> Gastadores
      </div>
      <div className="absolute top-8 left-0 text-[10px] font-bold text-gray-600 bg-white/90 px-2 py-1 rounded shadow-sm border border-gray-100 animate-float" style={{ animationDelay: '1.5s' }}>
        <span className="text-chart-yellow">●</span> Promotores
      </div>
    </div>
  </VisualCard>
);

// --- Row 3: Topics (QUADRANTS / MATRIX) ---

export const TopicsCard = () => (
  <TextCard title="Mapa de Tópicos" icon={BarChart3}>
    <p>Matriz de impacto. Clasificamos los temas de conversación en cuatro cuadrantes según su volumen y sentimiento, identificando oportunidades de alto valor (High Volume / Positive).</p>
  </TextCard>
);

export const TopicsVisual = () => (
  <VisualCard>
    <div className="relative w-full h-64 border-l-2 border-b-2 border-gray-200 m-4">
      {/* Labels */}
      <div className="absolute -left-6 top-1/2 -rotate-90 text-[10px] font-bold text-gray-400 uppercase tracking-widest origin-center whitespace-nowrap">Volumen →</div>
      <div className="absolute bottom-[-20px] left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Sentimiento →</div>

      {/* Quadrant Backgrounds */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-chart-green/5 border-l border-b border-dashed border-gray-200 flex items-center justify-center">
        <span className="text-chart-green font-bold text-xs opacity-30">Oportunidad</span>
      </div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-chart-red/5 border-t border-r border-dashed border-gray-200 flex items-center justify-center">
        <span className="text-chart-red font-bold text-xs opacity-30">Crítico</span>
      </div>

      {/* Data Bubbles */}
      {[
        { x: '80%', y: '20%', r: 24, c: CHART.green, label: 'Tech' },    // High Vol, High Sent
        { x: '20%', y: '80%', r: 16, c: CHART.red, label: 'Bug' },       // Low Vol, Low Sent
        { x: '70%', y: '70%', r: 20, c: CHART.yellow, label: 'Price' },  // High Vol, Mid Sent
        { x: '30%', y: '30%', r: 14, c: CHART.blue, label: 'UX' },       // Low Vol, High Sent
        { x: '50%', y: '50%', r: 18, c: CHART.blue, label: 'Support' }
      ].map((b, i) => (
        <div
          key={i}
          className="absolute rounded-full flex items-center justify-center shadow-md animate-float group cursor-help"
          style={{
            left: b.x,
            top: b.y,
            width: b.r * 2,
            height: b.r * 2,
            backgroundColor: b.c,
            transform: 'translate(-50%, -50%)',
            animationDelay: `${i * 0.5}s`
          }}
          title={b.label}
        >
          <span className="text-[10px] font-bold text-white drop-shadow-sm pointer-events-none truncate max-w-[90%]">{b.label}</span>
        </div>
      ))}
    </div>
  </VisualCard>
);
};

// --- Row 4: Competitive (MOVING NEEDLE) ---

export const CompetitiveCard = () => (
  <TextCard title="Inteligencia Competitiva" icon={Target}>
    <p>Velocímetro de mercado. Monitoreo en tiempo real de la cuota de mercado frente a competidores. La aguja oscila dinámicamente reflejando la volatilidad y actualizaciones en vivo.</p>
  </TextCard>
);

export const CompetitiveVisual = () => (
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
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Tick Marks */}
        {Array.from({ length: 40 }).map((_, i) => {
          const angle = 180 + (i / 39) * 180;
          const r1 = 110; const r2 = 100;
          const x1 = 120 + r1 * Math.cos(angle * Math.PI / 180);
          const y1 = 120 + r1 * Math.sin(angle * Math.PI / 180);
          const x2 = 120 + r2 * Math.cos(angle * Math.PI / 180);
          const y2 = 120 + r2 * Math.sin(angle * Math.PI / 180);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#e5e7eb" strokeWidth="2" />
        })}

        {/* Arc */}
        <path d="M 30 120 A 90 90 0 0 1 210 120" fill="none" stroke="url(#gaugeMain)" strokeWidth="12" strokeLinecap="round"
          filter="url(#glowGauge)" />

        {/* Hub */}
        <circle cx="120" cy="120" r="10" fill="#1f2937" className="drop-shadow-lg" />

        {/* Moving Needle - Uses 'needle-sweep' animation defined in index.html */}
        <g className="origin-[120px_120px] animate-needle-sweep drop-shadow-md">
          <path d="M 120 120 L 120 35 L 116 120 Z" fill="#1f2937" />
          <circle cx="120" cy="35" r="5" fill={CHART.magenta} stroke="white" strokeWidth="2" />
        </g>

        {/* Labels */}
        <text x="30" y="140" className="text-xs font-bold fill-gray-400">0%</text>
        <text x="210" y="140" className="text-xs font-bold fill-gray-400" textAnchor="end">100%</text>
      </svg>
    </div>
  </VisualCard>
);

// --- Row 5: Channels (CHECKLIST) ---

export const ChannelsCard = () => (
  <TextCard title="Auditoría de Canales" icon={Search}>
    <p>Checklist de salud digital. Verificación paso a paso del rendimiento de cada canal. Identificamos visualmente qué canales están optimizados y cuáles requieren atención inmediata.</p>
  </TextCard>
);

export const ChannelsVisual = () => (
  <VisualCard>
    <div className="w-full max-w-sm flex flex-col gap-3">
      {[
        { label: 'SEO Técnico', status: 'Optimizado', color: CHART.green, icon: CheckCircle2 },
        { label: 'Social Engagement', status: 'En Riesgo', color: CHART.yellow, icon: AlertCircle },
        { label: 'Paid Acquisition', status: 'Crítico', color: CHART.red, icon: AlertCircle },
        { label: 'Email Automation', status: 'Optimizado', color: CHART.green, icon: CheckCircle2 },
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

// --- Row 6: Content Strategy (Unchanged Visual, just reference) ---
export const ContentStratCard = () => (
  <TextCard title="Estrategia de Contenidos" icon={Layers}>
    <p>Roadmap editorial basado en datos. Definimos pilares de comunicación que resuenan con cada arquetipo de usuario.</p>
  </TextCard>
);

export const ContentStratVisual = () => (
  <VisualCard>
    <div className="relative w-48 h-48 flex items-center justify-center [perspective:800px]">
      <div className="relative w-32 h-32 [transform-style:preserve-3d] [transform:rotateX(60deg)_rotateZ(45deg)] group-hover:[transform:rotateX(50deg)_rotateZ(45deg)_translateZ(20px)] transition-transform duration-500">
        <div className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-200 flex items-center justify-center [transform:translateZ(0px)] transition-transform duration-300 group-hover:[transform:translateZ(0px)]"></div>
        <div className="absolute inset-0 bg-primary-50 rounded-2xl shadow-xl border border-primary-100 flex items-center justify-center [transform:translateZ(30px)] transition-transform duration-300 group-hover:[transform:translateZ(50px)]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl shadow-2xl border border-primary-400 flex items-center justify-center [transform:translateZ(60px)] transition-transform duration-300 group-hover:[transform:translateZ(100px)]">
          <Layers className="text-white [transform:rotateZ(-45deg)_rotateX(0deg)] drop-shadow-md" size={32} />
        </div>
      </div>
    </div>
  </VisualCard>
);

// --- Row 7: Conversion (FUNNEL CHART) ---

export const ConversionCard = () => (
  <TextCard title="Optimización de Conversión" icon={TrendingUp}>
    <p>Embudo de conversión. Visualización 3D del flujo de usuarios desde la visita hasta la compra. Detecta claramente dónde ocurre la mayor caída (drop-off) en el proceso.</p>
  </TextCard>
);

export const ConversionVisual = () => (
  <VisualCard>
    <div className="flex flex-col items-center justify-center w-full max-w-[240px] gap-1">

      {/* Stage 1: Awareness */}
      <div
        className="w-full h-12 bg-gradient-to-r from-chart-blue to-blue-400 rounded-sm relative flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform z-30 group cursor-pointer"
        style={{ clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)' }}
      >
        <span className="text-white font-bold text-sm">Visitas (100%)</span>
        <div className="absolute right-[-40px] opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded">10k</div>
      </div>

      {/* Connector */}
      <div className="h-1 w-1 bg-gray-200 rounded-full"></div>

      {/* Stage 2: Interest */}
      <div
        className="w-[90%] h-12 bg-gradient-to-r from-chart-green to-teal-400 rounded-sm relative flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform z-20 group cursor-pointer"
        style={{ clipPath: 'polygon(0 0, 100% 0, 85% 100%, 15% 100%)' }}
      >
        <span className="text-white font-bold text-sm">Leads (60%)</span>
        <div className="absolute right-[-40px] opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded">6k</div>
      </div>

      {/* Connector */}
      <div className="h-1 w-1 bg-gray-200 rounded-full"></div>

      {/* Stage 3: Consideration */}
      <div
        className="w-[80%] h-12 bg-gradient-to-r from-chart-yellow to-yellow-400 rounded-sm relative flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform z-10 group cursor-pointer"
        style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 20% 100%)' }}
      >
        <span className="text-white font-bold text-sm text-shadow">Carrito (30%)</span>
        <div className="absolute right-[-40px] opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded">3k</div>
      </div>

      {/* Connector */}
      <div className="h-1 w-1 bg-gray-200 rounded-full"></div>

      {/* Stage 4: Conversion */}
      <div
        className="w-[70%] h-12 bg-gradient-to-r from-chart-red to-pink-500 rounded-sm relative flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform z-0 group cursor-pointer"
        style={{ clipPath: 'polygon(0 0, 100% 0, 75% 100%, 25% 100%)' }}
      >
        <span className="text-white font-bold text-sm text-shadow">Ventas (10%)</span>
        <div className="absolute right-[-40px] opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1 rounded">1k</div>
      </div>
    </div>
  </VisualCard>
);

// --- Row 8: Roadmap (Unchanged) ---
export const RoadmapCard = () => (
  <TextCard title="Roadmap Estratégico" icon={Map}>
    <p>Plan de acción táctico a 12 meses. Priorizamos las iniciativas de alto impacto y bajo esfuerzo para generar victorias rápidas (Quick Wins).</p>
  </TextCard>
);

export const RoadmapVisual = () => (
  <VisualCard>
    <div className="w-full h-40 relative flex items-center justify-center">
      <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
        <path d="M 20 60 Q 90 10 150 60 T 280 60" fill="none" stroke="#e5e7eb" strokeWidth="4" strokeDasharray="8 8" />
        <path d="M 20 60 Q 90 10 150 60 T 280 60" fill="none" stroke={CHART.magenta} strokeWidth="2" strokeDasharray="1000" strokeDashoffset="0" className="animate-draw-path" />
        {[
          { x: 20, y: 60, c: CHART.green, label: 'Q1' },
          { x: 150, y: 60, c: CHART.blue, label: 'Q2' },
          { x: 280, y: 60, c: CHART.yellow, label: 'Q3' }
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