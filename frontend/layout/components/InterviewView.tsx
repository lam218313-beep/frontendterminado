import React from 'react';
import { MultiStepForm } from '../entrevista/components/MultiStepForm';
import { WorkflowStepper } from './WorkflowStepper';
import { AnimatedHeaderCard } from './AnimatedHeaderCard';

export const InterviewView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
    return (
        <div className="p-4 md:p-8 h-full overflow-y-auto custom-scrollbar">
            <div className="max-w-7xl mx-auto">
                <WorkflowStepper currentStep={1} onNavigate={onNavigate} />

                <AnimatedHeaderCard
                    supertitle="Fase 1: Descubrimiento"
                    title="Entrevista"
                    subtitle="Diagnóstico inicial de la marca."
                />

                <MultiStepForm />
            </div>
        </div>
    );
};
