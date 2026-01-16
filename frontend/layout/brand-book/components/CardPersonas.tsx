import React from 'react';
import { Users, AlertTriangle, Star, Heart, TrendingUp } from 'lucide-react';
import { BrandIdentityData } from './BrandBookCards';

interface CardPersonasProps {
    data?: BrandIdentityData;
}

export const CardPersonas: React.FC<CardPersonasProps> = ({ data }) => {
    const ideal = data?.personas?.ideal;
    const anti = data?.personas?.anti;

    if (!ideal && !anti) return null;

    return (
        <div className="h-full bg-white rounded-[40px] p-8 md:p-10 shadow-sm border border-gray-100 flex flex-col relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <Users size={20} />
                </div>
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Arquetipos de Cliente</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
                {/* 1. Cliente Ideal */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50/30 rounded-3xl p-6 border border-green-100/50 flex flex-col group hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-green-200 text-green-700 rounded-md">
                                <Star size={14} fill="currentColor" />
                            </span>
                            <span className="text-xs font-bold text-green-800 uppercase tracking-wider">Cliente Ideal</span>
                        </div>
                        <span className="text-[10px] font-mono text-green-600 opacity-60">LTV: Alto</span>
                    </div>

                    <h3 className="text-2xl font-black text-gray-800 mb-1 leading-tight">
                        {ideal?.name || "El Evangelista"}
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-4">{ideal?.occupation || "Profesional"}</p>

                    <div className="space-y-3 mt-auto">
                        <div className="bg-white/60 p-3 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1 text-green-700">
                                <Heart size={12} fill="currentColor" />
                                <span className="text-[10px] font-bold uppercase">Deseo Profundo</span>
                            </div>
                            <p className="text-sm text-gray-600 leading-snug">{ideal?.desires || "Transformación total."}</p>
                        </div>

                        <div className="bg-white/60 p-3 rounded-xl backdrop-blur-sm">
                            <div className="flex items-center gap-2 mb-1 text-indigo-600">
                                <TrendingUp size={12} />
                                <span className="text-[10px] font-bold uppercase">Motivación</span>
                            </div>
                            <p className="text-sm text-gray-600 leading-snug">{ideal?.ideal_reason || "Encaja perfectamente."}</p>
                        </div>
                    </div>
                </div>

                {/* 2. Anti-Persona */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50/30 rounded-3xl p-6 border border-red-100/50 flex flex-col group hover:shadow-md transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 bg-red-200 text-red-700 rounded-md">
                                <AlertTriangle size={14} />
                            </span>
                            <span className="text-xs font-bold text-red-800 uppercase tracking-wider">Anti-Persona</span>
                        </div>
                        <span className="text-[10px] font-mono text-red-600 opacity-60">Riesgo</span>
                    </div>

                    <h3 className="text-2xl font-black text-gray-800 mb-1 leading-tight">
                        {anti?.name || "El Detractor"}
                    </h3>
                    <p className="text-xs font-bold text-gray-400 uppercase mb-4">{anti?.occupation || "Oportunista"}</p>

                    <div className="space-y-3 mt-auto">
                        <div className="bg-white/60 p-3 rounded-xl backdrop-blur-sm">
                            <span className="text-[10px] font-bold text-red-700 uppercase block mb-1">Pain Point (Queja)</span>
                            <p className="text-sm text-gray-600 leading-snug">{anti?.painPoints || "Precio y exigencia."}</p>
                        </div>

                        <div className="bg-white/60 p-3 rounded-xl backdrop-blur-sm">
                            <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Por qué evitarlo</span>
                            <p className="text-sm text-gray-500 leading-snug">{anti?.avoid_reason || "Consume demasiados recursos."}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
