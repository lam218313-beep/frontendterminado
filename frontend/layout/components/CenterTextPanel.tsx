import React from 'react';
import { motion } from 'framer-motion';

interface CenterTextPanelProps {
    children: React.ReactNode;
    title?: string;
    subtitle?: string;
}

export const CenterTextPanel: React.FC<CenterTextPanelProps> = ({ children, title, subtitle }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="relative max-w-3xl w-full"
        >
            {/* Glassmorphism Panel */}
            <div className="bg-white/10 backdrop-blur-xl rounded-[40px] border border-white/20 shadow-2xl p-8 md:p-12 lg:p-16">
                {/* Optional badge/tag */}
                {subtitle && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="inline-block mb-4"
                    >
                        <span className="text-xs font-bold uppercase tracking-wider text-primary-600 bg-primary-50 px-4 py-2 rounded-full">
                            {subtitle}
                        </span>
                    </motion.div>
                )}

                {/* Title */}
                {title && (
                    <motion.h2
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-3xl md:text-4xl lg:text-5xl font-display font-black text-gray-800 mb-6 leading-tight"
                    >
                        {title}
                    </motion.h2>
                )}

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-gray-700 text-base md:text-lg leading-relaxed space-y-4"
                >
                    {children}
                </motion.div>
            </div>

            {/* Decorative glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-primary-400/20 via-accent-400/20 to-primary-400/20 rounded-[48px] blur-3xl -z-10 opacity-50" />
        </motion.div>
    );
};
