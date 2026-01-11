import React from 'react';
import { WorkflowStepper } from './WorkflowStepper';
import { ValidationKanban } from './ValidationKanban';

import { InteractiveHeader } from './InteractiveHeader';

export const ContentPlanView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
    return (
        <div className='p-8 h-full overflow-y-auto custom-scrollbar animate-fade-in-up bg-[#F4F7FE]'>
            <div className="max-w-7xl mx-auto">
                <WorkflowStepper currentStep={5} onNavigate={onNavigate} />
                <div className='mb-8'>
                    <InteractiveHeader
                        title="Planificación"
                        subtitle="Calendario de contenidos y tareas."
                        supertitle="Fase 5: Ejecución"
                        colors={['#F20F79', '#465362']}
                    />
                </div>
                <div className='bg-white/50 backdrop-blur-xl rounded-[30px] border border-white shadow-sm min-h-[400px] overflow-hidden'>
                    <ValidationKanban />
                </div>
            </div>
        </div>
    );
};
