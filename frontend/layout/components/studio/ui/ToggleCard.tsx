import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface ToggleCardProps {
    title: string;
    content: string;
    isSelected: boolean;
    onToggle: () => void;
}

export const ToggleCard: React.FC<ToggleCardProps> = ({ title, content, isSelected, onToggle }) => {
    return (
        <motion.div
            layout
            onClick={onToggle}
            className={`
                relative p-5 rounded-2xl border cursor-pointer transition-all duration-300 group
                ${isSelected
                    ? 'bg-white border-primary-500 ring-2 ring-primary-100 shadow-lg shadow-primary-500/10'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-white'
                }
            `}
        >
            <Check size={14} strokeWidth={3} />
        </div>
                </div >

    <p className="text-gray-300 text-sm leading-relaxed line-clamp-3 group-hover:line-clamp-none transition-all duration-1000">
        {content || <span className="text-gray-600 italic">Sin contenido disponible...</span>}
    </p>

{/* Hover Actions (Edit Mockup) */ }
{
    isSelected && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-end opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[10px] uppercase text-indigo-400 font-bold mr-2">Incluido en Prompt</span>
        </div>
    )
}
            </div >
        </div >
    );
};
