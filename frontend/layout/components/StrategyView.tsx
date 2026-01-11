import React from 'react';
import { WorkflowStepper } from './WorkflowStepper';
import StrategyMap from '../estrategia/App';

import { InteractiveHeader } from './InteractiveHeader';

export const StrategyView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
    return (
        <div className='p-4 md:p-8 h-full overflow-y-auto custom-scrollbar animate-fade-in-up bg-brand-bg flex flex-col'>
            <div className="max-w-7xl mx-auto w-full flex-shrink-0">
                <WorkflowStepper currentStep={4} onNavigate={onNavigate} />
                <div className='mb-4'>
                    <InteractiveHeader
                        title="Estrategia"
                        subtitle="Definición del mapa estratégico y táctico."
                        supertitle="Fase 4: Dirección"
                        colors={['#F20F79', '#465362']}
                    />
                </div>
            </div>

            {/* Strategy Map Module */}
            <div className='flex-1 w-full rounded-[30px] overflow-hidden border border-gray-200 shadow-sm bg-white'>
                <StrategyMap />
            </div>
        </div>
    );
};
