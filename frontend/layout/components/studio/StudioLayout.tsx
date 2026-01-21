import React from 'react';
import { useStudio } from '../../contexts/StudioContext';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';

interface StudioLayoutProps {
    children: React.ReactNode;
}

const STEPS = [
    { id: 1, label: 'Contexto' },
    { id: 2, label: 'Estrategia' },
    { id: 3, label: 'Assets' },
    { id: 4, label: 'Estilo' },
    { id: 5, label: 'Generación' },
];

export const StudioLayout: React.FC<StudioLayoutProps> = ({ children }) => {
    const { state } = useStudio();
    const progress = (state.currentStep / state.totalSteps) * 100;

    return (
        <div className="flex flex-col h-full bg-[#1A1A1A] text-white overflow-hidden">
            {/* HEADER */}
            <header className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-lg border border-white/10">
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Pixely Creative Studio
                        </h1>
                        <p className="text-xs text-gray-500">AI Image Generation Wizard v2.0</p>
                    </div>
                </div>

                {/* STEP INDICATOR */}
                <div className="flex items-center gap-2">
                    {STEPS.map((step) => (
                        <div key={step.id} className="flex items-center">
                            <div
                                className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                            ${state.currentStep === step.id
                                        ? 'bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)] border border-indigo-400'
                                        : state.currentStep > step.id
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                                            : 'bg-white/5 text-gray-500 border border-white/5'
                                    }
                        `}
                            >
                                {state.currentStep > step.id ? '✓' : step.id}
                            </div>
                            {step.id < STEPS.length && (
                                <div className={`w-8 h-[2px] mx-2 rounded-full transition-colors duration-300 ${state.currentStep > step.id ? 'bg-emerald-500/30' : 'bg-white/5'}`} />
                            )}
                        </div>
                    ))}
                </div>
            </header>

            {/* PROGRESS BAR */}
            <div className="w-full h-1 bg-white/5">
                <motion.div
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                />
            </div>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto px-8 py-8 relative">
                <div className="max-w-6xl mx-auto h-full">
                    {children}
                </div>
            </main>

            {/* FOOTER ACTIONS (Generic placeholder, specific implementations usually inside steps but can be global) */}
            {/* This area can be used for global "Next" / "Back" buttons if desired, 
          but usually steps manage their own validation logic before enabling "Next". */}
        </div>
    );
};
