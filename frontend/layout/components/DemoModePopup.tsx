/**
 * DemoModePopup Component
 * 
 * Shows a popup when user accesses a restricted view without proper plan access.
 * Only shows once per session per view.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, MessageCircle, Sparkles } from 'lucide-react';

interface DemoModePopupProps {
    viewId: string;           // Unique ID for this view (e.g., 'lab', 'strategy')
    requiredPlanName: string; // Name of required plan to show to user
    onClose?: () => void;     // Optional callback on close
}

// Track shown popups in session storage
const SHOWN_KEY = 'pixely_demo_popups_shown';

function getShownPopups(): string[] {
    try {
        return JSON.parse(sessionStorage.getItem(SHOWN_KEY) || '[]');
    } catch {
        return [];
    }
}

function markPopupShown(viewId: string) {
    const shown = getShownPopups();
    if (!shown.includes(viewId)) {
        shown.push(viewId);
        sessionStorage.setItem(SHOWN_KEY, JSON.stringify(shown));
    }
}

export const DemoModePopup: React.FC<DemoModePopupProps> = ({
    viewId,
    requiredPlanName,
    onClose
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if already shown this session
        const shown = getShownPopups();
        if (!shown.includes(viewId)) {
            // Show after a small delay for better UX
            const timer = setTimeout(() => {
                setIsVisible(true);
                markPopupShown(viewId);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [viewId]);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    const handleContact = () => {
        window.open('https://wa.me/51949268607?text=Hola!%20Me%20interesa%20actualizar%20mi%20plan%20en%20Pixely', '_blank');
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden"
                    >
                        {/* Background decoration */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary-100 rounded-full opacity-50 blur-3xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-100 rounded-full opacity-50 blur-3xl"></div>

                        {/* Close button */}
                        <button
                            onClick={handleClose}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        {/* Icon */}
                        <div className="relative mb-6 flex justify-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl flex items-center justify-center shadow-lg shadow-primary-500/30">
                                <Lock className="text-white" size={36} />
                            </div>
                            <div className="absolute -top-1 -left-1 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-md animate-bounce">
                                <Sparkles className="text-white" size={16} />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="relative text-center">
                            <h2 className="text-2xl font-black text-gray-900 mb-2">
                                Vista de Demostración
                            </h2>
                            <p className="text-gray-500 mb-6 leading-relaxed">
                                Estás viendo <span className="font-bold text-gray-700">datos de ejemplo</span>.
                                Actualiza tu plan a <span className="font-bold text-primary-600">{requiredPlanName}</span> para
                                acceder a tu información real.
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={handleClose}
                                    className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                >
                                    Cerrar
                                </button>
                                <button
                                    onClick={handleContact}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
                                >
                                    <MessageCircle size={18} />
                                    Contactar
                                </button>
                            </div>

                            {/* Help text */}
                            <p className="text-xs text-gray-400 mt-4">
                                ¿Tienes dudas? Escríbenos por WhatsApp
                            </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DemoModePopup;
