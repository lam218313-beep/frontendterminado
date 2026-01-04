import React from 'react';
import PartnersPage from './components/PartnersPage';

const App: React.FC = () => {
  return (
    <div className="min-h-screen w-full bg-[#F4F7FE] text-gray-800 font-sans selection:bg-magenta-500 selection:text-white">
       {/* 
         In a real scenario, a Sidebar would exist here. 
         We are simulating the layout structure where the main content 
         sits to the side of a navigation bar.
       */}
       <div className="relative w-full">
         <PartnersPage />
       </div>
    </div>
  );
};

export default App;