import React from 'react';
import { WorkflowStepper } from './WorkflowStepper';
import { ValidationKanban } from './ValidationKanban';

export const ContentPlanView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
    return (
        <div className='p-8 h-full overflow-y-auto custom-scrollbar animate-fade-in-up bg-[#F4F7FE]'>
            <div className="max-w-7xl mx-auto">
                <WorkflowStepper currentStep={5} onNavigate={onNavigate} />
                <div className='mb-8'>
                    <h2 className='text-3xl font-black text-brand-dark mb-2 tracking-tight'>Plan de Contenido y Validación</h2>
                    <p className='text-gray-500'>Organiza tu calendario y gestiona aprobaciones de contenido.</p>
                </div>
                <div className='bg-white/50 backdrop-blur-xl rounded-[30px] border border-white shadow-sm min-h-[400px] overflow-hidden'>
                    <ValidationKanban />
                </div>
            </div>
        </div>
    );
};
