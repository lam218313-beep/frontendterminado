import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ClipboardList, 
  Palette, 
  LayoutGrid, 
  Layers, 
  Calendar, 
  CheckCircle2
} from 'lucide-react';

const TABS = [
  { id: 'entrevista', label: 'Entrevista', icon: ClipboardList, desc: 'Recopilación de datos inicial' },
  { id: 'manual', label: 'Manual', icon: Palette, desc: 'Definición de identidad visual' },
  { id: 'estrategia', label: 'Estrategia', icon: LayoutGrid, desc: 'Planificación de arquitectura' },
  { id: 'beneficios', label: 'Beneficios', icon: Layers, desc: 'Análisis de valor agregado' },
  { id: 'planificacion', label: 'Planificación', icon: Calendar, desc: 'Cronograma de ejecución' },
  { id: 'validacion', label: 'Validación', icon: CheckCircle2, desc: 'Control de calidad final' },
];

export const PixelyTabs: React.FC = () => {
  const [activeTab, setActiveTab] = useState(2); // Start at index 2 (Estrategia) to match design mockup

  return (
    <div className="w-full max-w-6xl mx-auto">
      
      {/* --- TAB NAVIGATION BAR --- */}
      <div className="relative bg-white rounded-[24px] px-8 py-6 shadow-xl shadow-brand-dark/5 border border-white/50">
        
        {/* Progress Line Background */}
        <div className="absolute top-[45px] left-[60px] right-[60px] h-1.5 bg-gray-100 rounded-full z-0 overflow-hidden">
            {/* Animated Progress Line Foreground */}
            <motion.div 
                className="h-full bg-primary-500 rounded-full"
                initial={{ width: '0%' }}
                animate={{ width: `${(activeTab / (TABS.length - 1)) * 100}%` }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
        </div>

        {/* Tab Items */}
        <div className="relative z-10 flex justify-between items-start">
          {TABS.map((tab, index) => {
            const isActive = index === activeTab;
            const isCompleted = index < activeTab;

            return (
              <div 
                key={tab.id} 
                className="flex flex-col items-center gap-3 cursor-pointer group"
                onClick={() => setActiveTab(index)}
              >
                {/* Icon Circle */}
                <motion.div 
                  className={`w-12 h-12 rounded-full flex items-center justify-center border-4 transition-colors duration-300 relative ${
                    isActive 
                      ? 'bg-primary-500 border-primary-100 text-white shadow-[0_0_20px_rgba(242,15,121,0.4)]' 
                      : isCompleted 
                        ? 'bg-primary-500 border-white text-white'
                        : 'bg-white border-gray-100 text-gray-300 hover:border-primary-100 hover:text-primary-300'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ scale: isActive ? 1.15 : 1 }}
                >
                  <tab.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                  
                  {/* Ripple effect for active */}
                  {isActive && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-primary-500"
                        initial={{ scale: 1, opacity: 1 }}
                        animate={{ scale: 1.6, opacity: 0 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    />
                  )}
                </motion.div>

                {/* Label */}
                <div className="text-center">
                    <p className={`text-sm font-bold transition-colors duration-300 ${
                        isActive ? 'text-primary-600' : isCompleted ? 'text-brand-dark' : 'text-gray-300'
                    }`}>
                        {tab.label}
                    </p>
                    {isActive && (
                        <motion.span 
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[10px] text-gray-400 font-medium absolute w-32 -ml-16 mt-1"
                        >
                            Paso {index + 1} de {TABS.length}
                        </motion.span>
                    )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};