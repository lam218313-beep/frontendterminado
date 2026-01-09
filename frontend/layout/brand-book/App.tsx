import React from 'react';
import { Download } from 'lucide-react';

import {
    CardMission,
    CardValues,
    CardTone,
    CardLogo,
    CardColors,
    CardTypography,
    CardIconography,
    CardPatterns,
    CardStationery
} from './components/BrandBookCards';

const App: React.FC = () => {
    return (
        <div className="min-h-screen bg-[#F4F7FE] font-sans selection:bg-primary-500 selection:text-white pb-20">
            <main className="w-full p-4 md:p-8">
                <div className="max-w-7xl mx-auto">



                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">

                        {/* --- ROW 1: STRATEGY (Verbal Identity) --- */}

                        {/* 2. Mission & Vision (Large) */}
                        <div className="col-span-12 md:col-span-8 min-h-[300px]">
                            <CardMission />
                        </div>

                        {/* 3. Personality & Tone (Tall/Narrow) */}
                        <div className="col-span-12 md:col-span-4 min-h-[300px]">
                            <CardTone />
                        </div>

                        {/* --- ROW 2: CORE VISUALS --- */}

                        {/* 4. Logo Construction */}
                        <div className="col-span-12 md:col-span-6 min-h-[340px]">
                            <CardLogo />
                        </div>

                        {/* 5. Color Palette */}
                        <div className="col-span-12 md:col-span-6 min-h-[340px]">
                            <CardColors />
                        </div>

                        {/* --- ROW 3: DETAILS --- */}

                        {/* 6. Typography (Wide) */}
                        <div className="col-span-12 md:col-span-8 min-h-[280px]">
                            <CardTypography />
                        </div>

                        {/* 7. Iconography */}
                        <div className="col-span-12 md:col-span-4 min-h-[280px]">
                            <CardIconography />
                        </div>

                        {/* --- ROW 4: APPLICATIONS --- */}

                        {/* 8. Patterns & Graphics */}
                        <div className="col-span-12 md:col-span-4 min-h-[320px]">
                            <CardPatterns />
                        </div>

                        {/* 9. Stationery & Applications */}
                        <div className="col-span-12 md:col-span-4 min-h-[320px]">
                            <CardStationery />
                        </div>

                        {/* 10. Core Values (Pillars) */}
                        <div className="col-span-12 md:col-span-4 min-h-[320px]">
                            <CardValues />
                        </div>

                    </div>

                    {/* Download Button */}
                    <div className="mt-8 flex justify-end pb-8">
                        <button className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-bold text-sm hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        // onClick={() => window.print()} // Optional: Print functionality
                        >
                            <Download size={20} />
                            Descargar versión impresa
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default App;