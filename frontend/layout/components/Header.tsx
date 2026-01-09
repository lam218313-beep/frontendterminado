/**
 * Header Component with Plan Badge
 * 
 * Displays user greeting, plan badge, and profile photo
 */

import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Crown, Sparkles, Star, Zap, Gift } from 'lucide-react';

// Plan configuration with colors and icons
const PLAN_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
    free_trial: { label: 'Trial', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Gift },
    lite: { label: 'Lite', color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Zap },
    basic: { label: 'Basic', color: 'text-green-600', bgColor: 'bg-green-100', icon: Star },
    pro: { label: 'Pro', color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Sparkles },
    premium: { label: 'Premium', color: 'text-amber-600', bgColor: 'bg-gradient-to-r from-amber-100 to-yellow-100', icon: Crown },
};

interface HeaderProps {
    className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = '' }) => {
    const { user } = useAuth();

    if (!user) return null;

    const planConfig = PLAN_CONFIG[user.plan] || PLAN_CONFIG.free_trial;
    const PlanIcon = planConfig.icon;

    // Extract first name for greeting
    const displayName = user.email.split('@')[0];

    return (
        <header className={`flex items-center justify-between py-4 px-6 bg-white/80 backdrop-blur-sm border-b border-gray-100 ${className}`}>
            {/* Left: Plan Badge */}
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${planConfig.bgColor} border border-white/50 shadow-sm`}>
                <PlanIcon size={18} className={planConfig.color} />
                <span className={`text-sm font-bold ${planConfig.color}`}>
                    {planConfig.label}
                </span>
            </div>

            {/* Right: Greeting + Avatar */}
            <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">
                    Hola, <span className="font-bold text-gray-900">@{displayName}</span>
                </span>

                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20">
                    {displayName.charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    );
};

export default Header;
