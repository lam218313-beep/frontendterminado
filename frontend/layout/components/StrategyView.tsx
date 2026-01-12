import React from 'react';
import { WorkflowStepper } from './WorkflowStepper';
import { AnimatedHeaderCard } from './AnimatedHeaderCard';
import StrategyMap from '../estrategia/App';
import { DemoToast } from './DemoToast';
import { usePlanAccess } from '../hooks/usePlanAccess';

export const StrategyView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
    const { hasAccess, requiredPlanName } = usePlanAccess('estrategia');

    return (
        <div className='p-4 md:p-8 h-full overflow-y-auto custom-scrollbar animate-fade-in-up bg-brand-bg'>
            {/* Demo Toast for users without access */}
            <DemoToast show={!hasAccess} requiredPlanName={requiredPlanName} />
            <div className="max-w-7xl mx-auto">
                <WorkflowStepper currentStep={4} onNavigate={onNavigate} />

                <AnimatedHeaderCard
                    supertitle="Fase 4: Dirección"
                    title="Estrategia"
                    subtitle="Definición del mapa estratégico y táctico."
                />

                {/* Strategy Map Module */}
                <div className='h-[600px] rounded-[30px] overflow-hidden border border-gray-200 shadow-sm bg-white'>
                    <StrategyMap />
                </div>
            </div>
        </div>
    );
};
