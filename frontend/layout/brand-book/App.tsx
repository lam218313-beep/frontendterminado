import React from 'react';
import { Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { InteractiveHeader } from '../components/InteractiveHeader';

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
    // --- Data State ---
    const [brandData, setBrandData] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isGenerating, setIsGenerating] = React.useState(false);

    // Use real ClientID from Auth Context
    const { user } = useAuth();
    const CLIENT_ID = user?.fichaClienteId;

    const fetchBrand = async () => {
        if (!CLIENT_ID) {
            setIsLoading(false);
            return;
        }

        try {
            // Updated to use centralized API
            // Note: The API returns { status: "success", data: ... }
            const json = await api.getBrand(CLIENT_ID);

            if (json.status === "success" && json.data) {
                setBrandData(json.data);
            } else if (json.status === "empty") {
                // If empty, trigger auto-generation request
                generateBrand();
                return;
            }
        } catch (e) {
            console.error("Failed to load brand:", e);
        } finally {
            setIsLoading(false);
        }
    };

    const generateBrand = async () => {
        if (!CLIENT_ID) return;

        setIsGenerating(true);
        try {
            const json = await api.generateBrand(CLIENT_ID);
            if (json.status === "success") {
                setBrandData(json.data);
            }
        } catch (e) {
            console.error("Gen failed", e);
        } finally {
            setIsGenerating(false);
        }
    };

    React.useEffect(() => {
        fetchBrand();
    }, []);

    return (
        <div className="min-h-screen bg-[#F4F7FE] font-sans selection:bg-primary-500 selection:text-white pb-20">
            <main className="w-full p-4 md:p-8">
                <div className="max-w-7xl mx-auto">

                    {/* Header / Actions */}
                    <div className="mb-8">
                        <InteractiveHeader
                            title="Regenetix"
                            subtitle="El futuro de la regeneración celular."
                            supertitle="Brand Guidelines v2.0"
                            colors={['#F20F79', '#465362']}
                        />

                        <div className="flex justify-between items-center mt-6">
                            <h2 className="text-lg font-bold text-gray-400">Dashboard de Identidad</h2>
                            <div className="flex gap-2">
                                {isGenerating && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg animate-pulse">
                                        <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-xs font-bold">Generando Identidad...</span>
                                    </div>
                                )}
                                {!brandData && !isGenerating && !isLoading && (
                                    <button onClick={generateBrand} className="px-4 py-2 bg-brand-dark text-white rounded-lg text-xs font-bold">
                                        Regenerar Identidad
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Grid Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">

                        {/* --- ROW 1: STRATEGY (Verbal Identity) --- */}

                        {/* 2. Mission & Vision (Large) */}
                        <div className="col-span-12 md:col-span-8 min-h-[300px]">
                            <CardMission data={brandData} />
                        </div>

                        {/* 3. Personality & Tone (Tall/Narrow) */}
                        <div className="col-span-12 md:col-span-4 min-h-[300px]">
                            <CardTone data={brandData} />
                        </div>

                        {/* --- ROW 2: CORE VISUALS --- */}

                        {/* 4. Logo Construction */}
                        <div className="col-span-12 md:col-span-6 min-h-[340px]">
                            <CardLogo />
                        </div>

                        {/* 5. Color Palette */}
                        <div className="col-span-12 md:col-span-6 min-h-[340px]">
                            <CardColors data={brandData} />
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
                            <CardValues data={brandData} />
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