import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Volume2, VolumeX, Play, Pause, Sparkles, Users, Palette, BarChart3, Target, ListChecks, TrendingUp, Check } from 'lucide-react';

interface TutorialSlide {
    title: string;
    description: string;
    icon: any; // Lucide icon component
    audioUrl?: string;
    duration?: number;
}

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
    slides: TutorialSlide[];
}

// Icon Graphic Component with decorative elements
const SlideGraphic: React.FC<{ Icon: any; isActive: boolean }> = ({ Icon, isActive }) => {
    return (
        <div className="relative w-full h-full flex items-center justify-center">
            {/* Background decorative circles */}
            <motion.div
                animate={{ scale: isActive ? [1, 1.2, 1] : 1, opacity: isActive ? [0.3, 0.5, 0.3] : 0.3 }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-indigo-200/40 to-purple-200/40 blur-3xl"
            />
            <motion.div
                animate={{ scale: isActive ? [1, 1.15, 1] : 1, opacity: isActive ? [0.2, 0.4, 0.2] : 0.2 }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.3 }}
                className="absolute w-48 h-48 rounded-full bg-gradient-to-br from-purple-200/30 to-pink-200/30 blur-2xl"
            />

            {/* Main Icon */}
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "backOut" }}
                className="relative z-10"
            >
                <div className="relative">
                    {/* Icon glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl blur-2xl opacity-40" />

                    {/* Icon container */}
                    <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="relative bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl p-8 shadow-2xl border-2 border-white/50"
                    >
                        <Icon size={80} className="text-indigo-600" strokeWidth={1.5} />
                    </motion.div>
                </div>

                {/* Floating particles */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{
                            y: [0, -30, 0],
                            x: [0, Math.sin(i) * 20, 0],
                            opacity: [0.4, 0.8, 0.4]
                        }}
                        transition={{
                            duration: 3 + i * 0.5,
                            repeat: Infinity,
                            delay: i * 0.3
                        }}
                        className="absolute w-2 h-2 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400"
                        style={{
                            top: `${20 + i * 10}%`,
                            left: `${15 + i * 12}%`
                        }}
                    />
                ))}
            </motion.div>
        </div>
    );
};

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, slides }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setIsPlaying(true);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const currentSlide = slides[currentIndex];

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = currentSlide.audioUrl || '';
            if (currentSlide.audioUrl && isPlaying) {
                audioRef.current.play().catch(e => console.log("Audio play failed:", e));
            }
        }
    }, [currentIndex, isOpen, isPlaying, slides]);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsPlaying(true); // Auto-play audio on slide change
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsPlaying(true); // Auto-play audio on slide change
        }
    };

    const toggleAudio = () => {
        if (audioRef.current) {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/10 backdrop-blur-md"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-white/85 border-2 border-white/60 rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[520px] backdrop-blur-2xl"
                        style={{
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.6) inset',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,255,255,0.85))'
                        }}
                    >
                        {/* Graphic Section */}
                        <div className="relative w-full md:w-1/2 h-[300px] md:h-full bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-pink-50/60 flex items-center justify-center overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0"
                                >
                                    <SlideGraphic
                                        Icon={slides[currentIndex].icon}
                                        isActive={isOpen}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Audio Visualizer */}
                            {isPlaying && !isMuted && (
                                <div className="absolute bottom-6 left-6 flex gap-1.5 items-end h-12 bg-white/40 backdrop-blur-sm px-3 py-2 rounded-full border border-white/60">
                                    {[1, 2, 3, 4, 5, 3, 2].map((i, idx) => (
                                        <motion.div
                                            key={idx}
                                            animate={{ height: [10, 16 + i * 5, 10] }}
                                            transition={{ repeat: Infinity, duration: 0.5 + idx * 0.08 }}
                                            className="w-1.5 bg-gradient-to-t from-indigo-600 to-purple-500 rounded-full"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 p-8 md:p-10 flex flex-col relative">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 p-2.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-all"
                            >
                                <X size={22} />
                            </button>

                            {/* Text Content */}
                            <div className="flex-1 flex flex-col justify-center mt-4 md:mt-0 pr-8">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentIndex}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-5 leading-tight tracking-tight">
                                            {slides[currentIndex].title}
                                        </h2>
                                        <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium">
                                            {slides[currentIndex].description}
                                        </p>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            {/* Controls */}
                            <div className="mt-8 flex items-center justify-between">
                                {/* Audio Controls */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={toggleAudio}
                                        className="p-2.5 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                        title={isPlaying ? "Pausar" : "Reproducir"}
                                    >
                                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                                    </button>
                                    <button
                                        onClick={toggleMute}
                                        className="p-2.5 rounded-full text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                                        title={isMuted ? "Activar" : "Silenciar"}
                                    >
                                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                                    </button>
                                </div>

                                {/* Navigation */}
                                <div className="flex items-center gap-3">
                                    {/* Dots */}
                                    <div className="flex gap-2 mr-4">
                                        {slides.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`h-2 rounded-full transition-all duration-300 ${idx === currentIndex
                                                    ? 'w-8 bg-gradient-to-r from-indigo-600 to-purple-600'
                                                    : 'w-2 bg-slate-300'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={handlePrev}
                                        disabled={currentIndex === 0}
                                        className={`p-3 rounded-full border-2 transition-all ${currentIndex === 0
                                            ? 'text-slate-300 border-slate-200 cursor-not-allowed'
                                            : 'text-slate-700 border-slate-300 hover:bg-slate-50 hover:border-slate-400'
                                            }`}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <button
                                        onClick={handleNext}
                                        className="flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-full transition-all shadow-xl shadow-indigo-500/30 group"
                                    >
                                        <span>{currentIndex === slides.length - 1 ? 'Empezar' : 'Siguiente'}</span>
                                        {currentIndex < slides.length - 1 && (
                                            <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Hidden Audio Element */}
                    <audio ref={audioRef} onEnded={() => setIsPlaying(false)} className="hidden" />
                </div>
            )}
        </AnimatePresence>
    );
};
