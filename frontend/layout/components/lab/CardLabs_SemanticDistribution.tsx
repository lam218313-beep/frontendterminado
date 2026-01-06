import React from 'react';
import { Layers, ArrowUpRight } from 'lucide-react';

interface CardLabs_SemanticDistributionProps {
    className?: string;
    compact?: boolean; // For the login screen mini-version
}

export const CardLabs_SemanticDistribution: React.FC<CardLabs_SemanticDistributionProps> = ({ className = '', compact = false }) => {
    // Data (Hardcoded for now as per image or props later)
    const data = [
        { label: 'Validación', value: 58, color: '#5EEAD4', description: 'Experiencias positivas confirmadas', ringColor: 'stroke-teal-300' }, // Cyan
        { label: 'Deseo', value: 30, color: '#FDE047', description: 'Expectativas y necesidades futuras', ringColor: 'stroke-yellow-300' }, // Yellow
        { label: 'Fricción', value: 12, color: '#F87171', description: 'Puntos de dolor y quejas', ringColor: 'stroke-red-400' }, // Red
    ];

    // SVG Configuration for concentric rings
    const size = 200;
    const center = size / 2;
    const strokeWidth = 12;
    const baseRadius = 50;
    const gap = 15;

    // Helper to calculate arc path (simplified for 75% circle or full - image looks like open rings)
    // The image shows open rings. Let's make them partial circles mostly closed.
    // Actually, looking at the image:
    // Outer ring (Cyan): ~70% filled
    // Middle ring (Yellow): ~40% filled
    // Inner ring (Red): ~20% filled
    // All starting from top? Or just aesthetic concentric rings with visual data representation.
    // The image shows specific filled portions.

    // Let's implement dynamic arc calculation
    const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
        var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
        var start = polarToCartesian(x, y, radius, endAngle);
        var end = polarToCartesian(x, y, radius, startAngle);
        var largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
        var d = [
            "M", start.x, start.y,
            "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(" ");
        return d;
    }

    return (
        <div className={`bg-white rounded-3xl border border-gray-100 flex flex-col overflow-hidden shadow-sm ${className} ${compact ? 'p-2' : 'p-6 h-full'}`}>

            {/* Header */}
            <div className={`flex items-start justify-between mb-2`}>
                <div className="flex gap-2">
                    <div className={`rounded-xl bg-pink-50 flex items-center justify-center shrink-0 ${compact ? 'w-6 h-6' : 'w-10 h-10'}`}>
                        <Layers className="text-pink-500" size={compact ? 12 : 20} />
                    </div>
                    <div>
                        <h3 className={`font-bold text-gray-800 ${compact ? 'text-[10px]' : 'text-lg'}`}>Marcos Narrativos</h3>
                        <p className={`text-gray-400 ${compact ? 'text-[8px]' : 'text-xs'}`}>Distribución Semántica</p>
                    </div>
                </div>
                <div className="text-gray-300">
                    <ArrowUpRight size={compact ? 12 : 16} />
                </div>
            </div>

            {/* Content */}
            <div className={`flex flex-1 ${compact ? 'flex-col gap-1' : 'flex-col lg:flex-row gap-6 items-center'}`}>

                {/* Chart Area */}
                <div className={`relative flex items-center justify-center ${compact ? 'h-24 w-24 mx-auto' : 'h-48 w-48 shrink-0'}`}>
                    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
                        {/* Background Tracks (Optional, maybe faint gray full circles) */}
                        {/* Ring 1 (Outer - Cyan) */}
                        <path d={describeArc(center, center, baseRadius + (gap * 2), 0, 360 * (data[0].value / 100))}
                            fill="none" stroke={data[0].color} strokeWidth={strokeWidth} strokeLinecap="round" />
                        <path d={describeArc(center, center, baseRadius + (gap * 2), 0, 360)}
                            fill="none" stroke={data[0].color} strokeWidth={strokeWidth} className="opacity-10" />

                        {/* Ring 2 (Middle - Yellow) */}
                        <path d={describeArc(center, center, baseRadius + gap, 0, 360 * (data[1].value / 100))}
                            fill="none" stroke={data[1].color} strokeWidth={strokeWidth} strokeLinecap="round" />
                        <path d={describeArc(center, center, baseRadius + gap, 0, 360)}
                            fill="none" stroke={data[1].color} strokeWidth={strokeWidth} className="opacity-10" />

                        {/* Ring 3 (Inner - Red) */}
                        <path d={describeArc(center, center, baseRadius, 0, 360 * (data[2].value / 100))}
                            fill="none" stroke={data[2].color} strokeWidth={strokeWidth} strokeLinecap="round" />
                        <path d={describeArc(center, center, baseRadius, 0, 360)}
                            fill="none" stroke={data[2].color} strokeWidth={strokeWidth} className="opacity-10" />
                    </svg>

                    {/* Center Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className={`font-bold text-gray-800 ${compact ? 'text-xs' : 'text-2xl'}`}>100%</span>
                        {!compact && <span className="text-[10px] text-gray-400 tracking-wider">TOTAL</span>}
                    </div>
                </div>

                {/* Legend Area */}
                <div className={`flex-1 flex ${compact ? 'flex-row justify-between items-end w-full px-1' : 'flex-col justify-center gap-4 w-full'}`}>
                    {data.map((item, idx) => (
                        <div key={idx} className={`flex ${compact ? 'flex-col items-center gap-1 hover:bg-gray-50 rounded-lg p-1 transition-colors cursor-pointer' : 'items-start gap-3'}`} title={item.description}>
                            <div className={`rounded-full shrink-0 ${compact ? 'w-2 h-2' : 'w-3 h-3 mt-1.5'}`} style={{ backgroundColor: item.color }}></div>
                            <div className={`${compact ? 'text-center' : 'flex-1'}`}>
                                <div className={`flex ${compact ? 'flex-col' : 'justify-between items-center'}`}>
                                    <span className={`font-bold text-gray-700 ${compact ? 'text-[9px] leading-tight' : 'text-sm'}`}>{item.label}</span>
                                    <span className={`font-bold ${compact ? 'text-[9px]' : 'text-sm'}`} style={{ color: item.color }}>{item.value}%</span>
                                </div>
                                {!compact && (
                                    <p className="text-xs text-gray-400 mt-0.5 leading-tight">{item.description}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};
