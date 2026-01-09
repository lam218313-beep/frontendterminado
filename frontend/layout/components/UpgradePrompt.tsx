/**
 * UpgradePrompt Component
 * 
 * Glassmorphism card shown when user doesn't have access to a feature
 */

import React from 'react';
import { Lock, Sparkles, ArrowUpCircle } from 'lucide-react';

interface UpgradePromptProps {
    requiredPlan: string;
    featureName?: string;
    className?: string;
}

export const UpgradePrompt: React.FC<UpgradePromptProps> = ({
    requiredPlan,
    featureName = 'esta función',
    className = ''
}) => {
    return (
        <div className={`relative overflow-hidden rounded-3xl ${className}`}>
            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/80 to-white/40 backdrop-blur-xl" />

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-300/30 to-pink-300/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-br from-blue-300/20 to-cyan-300/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

            {/* Content */}
            <div className="relative z-10 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                {/* Lock Icon with Glow */}
                <div className="relative mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-full blur-xl scale-150" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center border-4 border-white shadow-2xl">
                        <Lock size={40} className="text-gray-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                        <Sparkles size={16} className="text-white" />
                    </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-gray-800 mb-3">
                    Función Exclusiva
                </h3>

                {/* Description */}
                <p className="text-gray-600 max-w-md mb-8 leading-relaxed">
                    Accede a {featureName} y desbloquea todo el potencial de la plataforma
                    mejorando tu plan a <span className="font-bold text-purple-600">{requiredPlan}</span>.
                </p>

                {/* CTA Button */}
                <button className="group flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all transform hover:-translate-y-1 hover:scale-105">
                    <ArrowUpCircle size={22} className="group-hover:rotate-12 transition-transform" />
                    <span>Mejorar a {requiredPlan}</span>
                </button>

                {/* Subtle Text */}
                <p className="mt-6 text-sm text-gray-400">
                    Contacta con nosotros para más información
                </p>
            </div>

            {/* Border Glow Effect */}
            <div className="absolute inset-0 rounded-3xl border border-white/50 pointer-events-none" />
        </div>
    );
};

export default UpgradePrompt;
