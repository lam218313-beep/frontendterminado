import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

interface BackgroundDashboardProps {
    step?: number;
}

export const BackgroundDashboard: React.FC<BackgroundDashboardProps> = ({ step = 0 }) => {
    // Animated bars data
    const bars = [
        { height: 60, color: 'bg-green-400', delay: 0 },
        { height: 80, color: 'bg-yellow-400', delay: 0.1 },
        { height: 50, color: 'bg-pink-400', delay: 0.2 },
        { height: 90, color: 'bg-green-400', delay: 0.3 },
        { height: 70, color: 'bg-orange-400', delay: 0.4 },
        { height: 85, color: 'bg-yellow-400', delay: 0.5 },
        { height: 65, color: 'bg-pink-400', delay: 0.6 },
        { height: 95, color: 'bg-green-400', delay: 0.7 },
        { height: 75, color: 'bg-orange-400', delay: 0.8 },
        { height: 88, color: 'bg-yellow-400', delay: 0.9 },
    ];

    // Line chart points for conversion metric
    const linePoints = "M0,60 Q25,40 50,45 T100,35 Q125,30 150,40 T200,38 L200,80 L0,80 Z";

    return (
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
            {/* Floating particles */}
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-primary-300/20 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -30, 0],
                            opacity: [0.2, 0.5, 0.2],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Left side: Animated Bar Chart */}
            <div className="absolute left-8 lg:left-16 top-1/2 -translate-y-1/2">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-xl"
                >
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                        Métricas Clave
                    </div>
                    <div className="flex items-end gap-2 h-32">
                        {bars.map((bar, i) => (
                            <motion.div
                                key={i}
                                className={`w-6 ${bar.color} rounded-t-lg cursor-pointer hover:opacity-80 transition-opacity`}
                                initial={{ height: 0 }}
                                animate={{ height: `${bar.height}%` }}
                                transition={{
                                    duration: 1,
                                    delay: bar.delay,
                                    repeat: Infinity,
                                    repeatType: 'reverse',
                                    repeatDelay: 2,
                                }}
                                whileHover={{ scale: 1.1 }}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Top right: Health Score Circle */}
            <div className="absolute right-8 lg:right-16 top-12 lg:top-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-xl"
                >
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                        Salud
                    </div>
                    <div className="relative w-24 h-24">
                        {/* Background circle */}
                        <svg className="w-full h-full -rotate-90">
                            <circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-gray-200"
                            />
                            {/* Animated progress circle */}
                            <motion.circle
                                cx="48"
                                cy="48"
                                r="40"
                                stroke="currentColor"
                                strokeWidth="8"
                                fill="none"
                                className="text-green-400"
                                initial={{ strokeDasharray: '0 251.2' }}
                                animate={{ strokeDasharray: '226 251.2' }}
                                transition={{ duration: 2, delay: 0.5 }}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-black text-gray-700">A+</span>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Bottom right: Conversion metric */}
            <div className="absolute right-8 lg:right-16 bottom-12 lg:bottom-16">
                <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="bg-white/40 backdrop-blur-md rounded-3xl p-6 border border-white/60 shadow-xl"
                >
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                        Conversión
                    </div>
                    <div className="text-3xl font-black text-gray-700 mb-3">4.5%</div>

                    {/* Mini line chart */}
                    <svg width="200" height="80" className="overflow-visible">
                        <motion.path
                            d={linePoints}
                            fill="url(#gradient)"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 1 }}
                        />
                        <motion.path
                            d="M0,60 Q25,40 50,45 T100,35 Q125,30 150,40 T200,38"
                            stroke="#fb923c"
                            strokeWidth="3"
                            fill="none"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 2, delay: 1 }}
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.3" />
                                <stop offset="100%" stopColor="#fb923c" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div className="flex items-center gap-1 text-xs text-green-600 font-bold mt-2">
                        <TrendingUp size={12} />
                        +12% vs anterior
                    </div>
                </motion.div>
            </div>
        </div>
    );
};
