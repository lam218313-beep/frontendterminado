import React from 'react';
import BrandBookApp from '../brand-book/App';
import { WorkflowStepper } from './WorkflowStepper';

export const BrandView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
    return (
        <div className="h-full overflow-y-auto custom-scrollbar animate-fade-in-up">
            <div className="max-w-7xl mx-auto px-4 md:px-8 pt-6">
                <WorkflowStepper currentStep={2} onNavigate={onNavigate} />
            </div>
            <BrandBookApp />
        </div>
    );
};
