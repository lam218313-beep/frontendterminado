/**
 * DemoToast Component
 * 
 * Mini notification that appears briefly when navigating to restricted views.
 * Less intrusive than the full DemoModePopup - just a reminder.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, X } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

interface DemoToastProps {
    show: boolean;
    requiredPlanName: string;
    onDismiss?: () => void;
}

export const DemoToast: React.FC<DemoToastProps> = ({
    show,
    requiredPlanName,
    onDismiss
}) => {
    const { user } = useAuth();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (!user) return;

        const storageKey = `pixely_demo_toast_seen_${user.email}`;
        const hasSeen = localStorage.getItem(storageKey);

        if (show && !hasSeen) {
            setIsVisible(true);
            // Mark as seen immediately so it doesn't show again on refresh/re-nav
            localStorage.setItem(storageKey, 'true');

            // Auto-dismiss after 6 seconds (longer read time for first/only view)
            const timer = setTimeout(() => {
                setIsVisible(false);
                onDismiss?.();
            }, 6000);
            return () => clearTimeout(timer);
        }
    }, [show, user, onDismiss]);

    const handleDismiss = () => {
        setIsVisible(false);
        onDismiss?.();
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 100 }}
                    className="fixed bottom-8 right-8 z-[9999] bg-white/95 backdrop-blur-xl border border-primary-200 shadow-lg shadow-primary-500/20 rounded-2xl px-5 py-3 flex items-center gap-3"
                >
                    {/* Icon */}
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Eye className="text-primary-600" size={16} />
                    </div>

                    {/* Text */}
                    <div className="text-sm">
                        <span className="text-gray-600">Modo demo · </span>
                        <span className="font-bold text-gray-800">Datos de ejemplo</span>
                        <span className="text-gray-400 ml-1.5">→ Plan {requiredPlanName}</span>
                    </div>

                    {/* Close */}
                    <button
                        onClick={handleDismiss}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600 ml-1"
                    >
                        <X size={14} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default DemoToast;
