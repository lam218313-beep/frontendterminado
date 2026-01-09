import React from 'react';
import { WorkflowStepper } from './WorkflowStepper';
import StrategyMap from '../../estrategia/App';

export const StrategyView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
    return (
        <div className='p-4 md:p-8 h-full overflow-y-auto custom-scrollbar animate-fade-in-up bg-brand-bg flex flex-col'>
            <div className="max-w-7xl mx-auto w-full flex-shrink-0">
                <WorkflowStepper currentStep={4} onNavigate={onNavigate} />
                <div className='mb-4'>
                    <h2 className='text-3xl font-black text-brand-dark mb-2 tracking-tight'>Estrategia</h2>
                    <p className='text-gray-500'>Definición del mapa estratégico y táctico.</p>
                </div>
            </div>

            {/* Strategy Map Module */}
            <div className='flex-1 w-full rounded-[30px] overflow-hidden border border-gray-200 shadow-sm bg-white'>
                <StrategyMap />
            </div>
        </div>
    );
};
