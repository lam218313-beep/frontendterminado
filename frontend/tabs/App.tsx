import React from 'react';
import { PixelyTabs } from './components/PixelyTabs';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-brand-bg font-sans selection:bg-primary-200 selection:text-primary-700 flex items-center justify-center">
      <main className="w-full p-4 md:p-12 max-w-7xl mx-auto">
        {/* Step by Step System */}
        <PixelyTabs />
      </main>
    </div>
  );
};

export default App;