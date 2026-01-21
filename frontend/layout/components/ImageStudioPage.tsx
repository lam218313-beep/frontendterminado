import React from 'react';
import { StudioProvider, useStudio } from '../contexts/StudioContext';
import { StudioLayout } from './studio/StudioLayout';
import { KnowledgeInput } from './studio/steps/KnowledgeInput';

// Steps placeholder for future implementation
const StrategyLinker = () => <div className="text-white p-10 text-center">Step 2: Strategy Linker (Coming Soon)</div>;
const AssetUploader = () => <div className="text-white p-10 text-center">Step 3: Asset Uploader (Coming Soon)</div>;
const StyleComposer = () => <div className="text-white p-10 text-center">Step 4: Style Composer (Coming Soon)</div>;
const ResultGallery = () => <div className="text-white p-10 text-center">Step 5: Generation (Coming Soon)</div>;

const WizardContent = () => {
    const { state } = useStudio();

    return (
        <>
            {state.currentStep === 1 && <KnowledgeInput />}
            {state.currentStep === 2 && <StrategyLinker />}
            {state.currentStep === 3 && <AssetUploader />}
            {state.currentStep === 4 && <StyleComposer />}
            {state.currentStep === 5 && <ResultGallery />}
        </>
    );
}

export const ImageStudioPage: React.FC = () => {
    return (
        <StudioProvider>
            <StudioLayout>
                <WizardContent />
            </StudioLayout>
        </StudioProvider>
    );
};
