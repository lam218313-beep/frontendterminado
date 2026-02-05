import React from 'react';
import { useStudio } from '../contexts/StudioContext';
import { StudioLayout } from './studio/StudioLayout';
import { 
    BrandDNAStep, 
    ImageBankStep, 
    TaskSelectorStep, 
    ReferenceSelectorStep, 
    GenerationStep 
} from './studio/steps';

const WizardContent = () => {
    const { state } = useStudio();

    return (
        <>
            {state.currentStep === 1 && <BrandDNAStep />}
            {state.currentStep === 2 && <ImageBankStep />}
            {state.currentStep === 3 && <TaskSelectorStep />}
            {state.currentStep === 4 && <ReferenceSelectorStep />}
            {state.currentStep === 5 && <GenerationStep />}
        </>
    );
}

export const ImageStudioPage: React.FC = () => {
    return (
        <StudioLayout>
            <WizardContent />
        </StudioLayout>
    );
};
