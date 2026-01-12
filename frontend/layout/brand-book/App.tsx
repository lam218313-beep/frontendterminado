import React from 'react';
import { Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { usePlanAccess } from '../hooks/usePlanAccess';
import { MOCK_BRAND_DATA } from '../mocks/mockBrandData';

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

    // Use real ClientID from Auth Context
    const { user } = useAuth();
    const CLIENT_ID = user?.fichaClienteId;

    // Check Plan Access
    const { hasAccess } = usePlanAccess('brand');

    const fetchBrand = async () => {
        // If Demo Mode (no access), use mock data
        if (!hasAccess) {
            setBrandData(MOCK_BRAND_DATA);
            setIsLoading(false);
            return;
        }

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
            }
            // Removed auto-generation on empty
        } catch (e) {
            console.error("Failed to load brand:", e);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchBrand();
    }, []);

    const handleDownload = () => {
        if (brandData?.download_url) {
            window.open(brandData.download_url, '_blank');
        } else {
            // Optional: Alert user if no link exists, or just do nothing
            // alert("No se ha configurado un enlace de descarga para esta marca.");
        }
    };

    return (
        <div className="font-sans selection:bg-primary-500 selection:text-white pb-12">
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
                    <CardLogo data={brandData} />
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

                {/* 9. Stationery */}
                <div className="col-span-12 md:col-span-8 min-h-[300px]">
                    <CardStationery data={brandData} />
                </div>

                {/* 10. Core Values (Pillars) */}
                <div className="col-span-12 md:col-span-4 min-h-[320px]">
                    <CardValues data={brandData} />
                </div>

            </div>

            {/* Download Button */}
            <div className="mt-8 flex justify-end pb-8">
                {brandData?.download_url && (
                    <button
                        className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-bold text-sm hover:bg-primary-600 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        onClick={handleDownload}
                    >
                        <Download size={20} />
                        Descargar versión impresa
                    </button>
                )}
            </div>
        </div>
    );
};

export default App;