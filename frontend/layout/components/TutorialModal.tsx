/**
 * TutorialModal.tsx
 * 
 * Wrapper for PixelyTutorial that manages visibility and launch logic.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PixelyTutorial } from './PixelyTutorial';
import { X } from 'lucide-react';

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                        className="w-full h-full md:w-[95vw] md:h-[95vh] relative bg-[#f8fafc] md:rounded-[40px] overflow-hidden shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 z-50 p-2 bg-white/20 backdrop-blur-md rounded-full text-slate-500 hover:text-red-500 hover:bg-white/40 transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Content */}
                        <PixelyTutorial />

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
