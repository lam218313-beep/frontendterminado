import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface TutorialSlide {
    title: string;
    description: string;
    image?: string; // URL for image or animation (Lottie alternative)
    audioUrl?: string; // URL for voiceover
    duration?: number; // Optional auto-advance duration
}

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
    slides: TutorialSlide[];
}

export const TutorialModal: React.FC<TutorialModalProps> = ({ isOpen, onClose, slides }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true); // Audio playing state
    const [isMuted, setIsMuted] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Reset on open
    useEffect(() => {
        if (isOpen) {
            setCurrentIndex(0);
            setIsPlaying(true);
        } else {
            // Stop audio on close
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }
    }, [isOpen]);

    // Handle Audio & Auto-advance
    useEffect(() => {
        if (!isOpen) return;

        const currentSlide = slides[currentIndex];

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = currentSlide.audioUrl || '';
            if (currentSlide.audioUrl && isPlaying) {
                audioRef.current.play().catch(e => console.log("Audio play failed (interaction needed):", e));
            }
        }

    }, [currentIndex, isOpen, isPlaying, slides]);

    const handleNext = () => {
        if (currentIndex < slides.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
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

    const variants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } // Apple-like ease
        },
        exit: (direction: number) => ({
            zIndex: 0,
            x: direction < 0 ? 100 : -100,
            opacity: 0,
            scale: 0.95,
            transition: { duration: 0.3 }
        })
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
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl bg-brand-dark/90 border border-white/10 rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[400px]"
                        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                    >
                        {/* Image/Visual Section (Top on mobile, Left on Desktop) */}
                        <div className="relative w-full md:w-5/12 h-[200px] md:h-full bg-gradient-to-br from-primary-600/20 to-purple-600/20 flex items-center justify-center overflow-hidden">
                            <AnimatePresence mode="wait" initial={false}>
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="absolute inset-0 flex items-center justify-center"
                                >
                                    {slides[currentIndex].image ? (
                                        <img src={slides[currentIndex].image} alt="Slide Visual" className="w-full h-full object-cover opacity-80" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-white/10 animate-pulse" />
                                    )}
                                </motion.div>
                            </AnimatePresence>

                            {/* Audio Visualizer Placeholder */}
                            {isPlaying && !isMuted && (
                                <div className="absolute bottom-4 left-4 flex gap-1 items-end h-8">
                                    {[1, 2, 3, 4, 3, 2].map((i, idx) => (
                                        <motion.div
                                            key={idx}
                                            animate={{ height: [8, 16 + i * 4, 8] }}
                                            transition={{ repeat: Infinity, duration: 0.5 + idx * 0.1 }}
                                            className="w-1 bg-primary-400 rounded-full opacity-80"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Content Section */}
                        <div className="flex-1 p-8 flex flex-col relative bg-gradient-to-br from-white/5 to-transparent">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <X size={20} />
                            </button>

                            {/* Text Content */}
                            <div className="flex-1 flex flex-col justify-center mt-4 md:mt-0">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentIndex}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight">
                                            {slides[currentIndex].title}
                                        </h2>
                                        <p className="text-gray-300 text-sm md:text-base leading-relaxed">
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
                                        className="p-2 rounded-full text-white/60 hover:text-primary-400 hover:bg-white/5 transition-colors"
                                        title={isPlaying ? "Pausar Narración" : "Reproducir Narración"}
                                    >
                                        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                                    </button>
                                    <button
                                        onClick={toggleMute}
                                        className="p-2 rounded-full text-white/60 hover:text-primary-400 hover:bg-white/5 transition-colors"
                                        title={isMuted ? "Activar Sonido" : "Silenciar"}
                                    >
                                        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                    </button>
                                </div>

                                {/* Navigation */}
                                <div className="flex items-center gap-3">
                                    {/* Dots */}
                                    <div className="flex gap-1.5 mr-4">
                                        {slides.map((_, idx) => (
                                            <div
                                                key={idx}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-6 bg-primary-500' : 'w-1.5 bg-white/20'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={handlePrev}
                                        disabled={currentIndex === 0}
                                        className={`p-3 rounded-full border border-white/10 transition-all ${currentIndex === 0
                                                ? 'text-white/20 cursor-not-allowed'
                                                : 'text-white hover:bg-white/10 hover:border-white/30'
                                            }`}
                                    >
                                        <ChevronLeft size={20} />
                                    </button>

                                    <button
                                        onClick={handleNext}
                                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-500 text-white font-bold rounded-full transition-all shadow-lg shadow-primary-600/30 group"
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
