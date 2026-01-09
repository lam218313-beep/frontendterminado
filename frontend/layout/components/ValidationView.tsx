import React from 'react';
import { WorkflowStepper } from './WorkflowStepper';

export const ValidationView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
    return (
        <div className='p-8 h-full overflow-y-auto custom-scrollbar animate-fade-in-up'>
            <div className="max-w-5xl mx-auto">
                <WorkflowStepper currentStep={7} onNavigate={onNavigate} />
                <div className='mb-8'>
                    <h2 className='text-3xl font-black text-brand-dark mb-2 tracking-tight'>Creación y Validación</h2>
                    <p className='text-gray-500'>Calendario de aprobación y feedback.</p>
                </div>
                <div className='bg-white/50 backdrop-blur-xl rounded-[30px] p-12 border border-white shadow-sm flex items-center justify-center min-h-[400px]'>
                    <div className="text-center text-gray-400">
                        <p className="text-xl font-bold mb-2">Panel en Construcción</p>
                        <p>Calendario interactivo para validar publicaciones.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
