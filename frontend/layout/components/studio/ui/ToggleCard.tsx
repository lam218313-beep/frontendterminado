import React, { useState } from 'react';
import { Check, Edit2, X } from 'lucide-react';

interface ToggleCardProps {
    title: string;
    content: string;
    isSelected: boolean;
    onToggle: () => void;
    onEdit?: (newText: string) => void; // Optional for implementation Phase 2
}

export const ToggleCard: React.FC<ToggleCardProps> = ({
    title,
    content,
    isSelected,
    onToggle,
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            className={`
        relative group rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden
        ${isSelected
                    ? 'bg-indigo-500/5 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                    : 'bg-white/5 border-white/5 hover:bg-white/[0.07] hover:border-white/10'
                }
      `}
            onClick={onToggle}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Header Strip */}
            <div className={`
            absolute top-0 left-0 w-1 h-full transition-colors duration-300
            ${isSelected ? 'bg-indigo-500' : 'bg-transparent'}
        `} />

            <div className="p-4 pl-6 relative z-10">
                <div className="flex justify-between items-start mb-2">
                    <h3 className={`text-sm font-semibold uppercase tracking-wider transition-colors ${isSelected ? 'text-indigo-400' : 'text-gray-400'}`}>
                        {title}
                    </h3>

                    <div className={`
            w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300
            ${isSelected
                            ? 'bg-indigo-500 border-indigo-500 text-white transform scale-100'
                            : 'bg-transparent border-white/20 text-transparent scale-90 group-hover:border-white/40'
                        }
          `}>
                        <Check size={14} strokeWidth={3} />
                    </div>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-1000">
                    {content || <span className="text-gray-600 italic">Sin contenido disponible...</span>}
                </p>

                {/* Hover Actions (Edit Mockup) */}
                {isSelected && (
                    <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-[10px] uppercase text-indigo-400 font-bold mr-2">Incluido en Prompt</span>
                    </div>
                )}
            </div>
        </div>
    );
};
