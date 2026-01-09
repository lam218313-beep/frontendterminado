import React from 'react';
import { WorkflowStepper } from './WorkflowStepper';

export const BenefitsView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
    return (
        <div className='p-8 h-full overflow-y-auto custom-scrollbar animate-fade-in-up bg-brand-bg'>
            <div className="max-w-7xl mx-auto">
                <WorkflowStepper currentStep={5} onNavigate={onNavigate} />
                <div className='mb-8'>
                    <h2 className='text-3xl font-black text-brand-dark mb-2 tracking-tight'>Beneficios</h2>
                    <p className='text-gray-500'>Análisis de valor agregado y resultados.</p>
                </div>
                {/* Blank Content */}
                <div className='bg-white/50 backdrop-blur-xl rounded-[30px] p-12 border border-white shadow-sm min-h-[400px] flex items-center justify-center'>
                    <span className="text-gray-400 font-medium">Contenido en blanco</span>
                </div>
            </div>
        </div>
    );
};
