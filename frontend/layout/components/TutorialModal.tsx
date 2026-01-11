import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Volume2, VolumeX, Play, Pause } from 'lucide-react';

interface TutorialSlide {
    title: string;
    description: string;
    animationType: 'particles' | 'neural' | 'pulse' | 'waves' | 'grid' | 'dna' | 'network' | 'sparkles';
    audioUrl?: string;
    duration?: number;
}

interface TutorialModalProps {
    isOpen: boolean;
    onClose: () => void;
    slides: TutorialSlide[];
}

// Canvas Animation Component
const SlideAnimation: React.FC<{ type: string; isActive: boolean }> = ({ type, isActive }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (!canvasRef.current || !isActive) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        let animationId: number;
        const particles: any[] = [];

        // Particle System
        if (type === 'particles') {
            for (let i = 0; i < 50; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 3 + 1
                });
            }
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                    ctx.beginPath();
                    const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
                    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
                    ctx.fillStyle = gradient;
                    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                    ctx.fill();
                });
                animationId = requestAnimationFrame(animate);
            };
            animate();
        }

        // Neural Network
        else if (type === 'neural') {
            for (let i = 0; i < 30; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                });
            }
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                    p.x += p.vx;
                    p.y += p.vy;
                    if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                    if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
                });

                // Draw connections
                particles.forEach((p1, i) => {
                    particles.slice(i + 1).forEach(p2 => {
                        const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                        if (dist < 150) {
                            ctx.strokeStyle = `rgba(139, 92, 246, ${1 - dist / 150})`;
                            ctx.lineWidth = 1;
                            ctx.beginPath();
                            ctx.moveTo(p1.x, p1.y);
                            ctx.lineTo(p2.x, p2.y);
                            ctx.stroke();
                        }
                    });
                    // Draw nodes
                    ctx.beginPath();
                    ctx.fillStyle = '#8b5cf6';
                    ctx.arc(p1.x, p1.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                });
                animationId = requestAnimationFrame(animate);
            };
            animate();
        }

        // Pulse/Heartbeat
        else if (type === 'pulse') {
            let pulse = 0;
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                pulse += 0.05;
                const radius = 40 + Math.sin(pulse) * 20;
                const centerX = canvas.width / 2;
                const centerY = canvas.height / 2;

                for (let i = 0; i < 3; i++) {
                    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius + i * 30);
                    gradient.addColorStop(0, `rgba(236, 72, 153, ${0.3 - i * 0.1})`);
                    gradient.addColorStop(1, 'rgba(236, 72, 153, 0)');
                    ctx.fillStyle = gradient;
                    ctx.beginPath();
                    ctx.arc(centerX, centerY, radius + i * 30, 0, Math.PI * 2);
                    ctx.fill();
                }
                animationId = requestAnimationFrame(animate);
            };
            animate();
        }

        // Waves
        else if (type === 'waves') {
            let time = 0;
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                time += 0.02;
                for (let i = 0; i < 3; i++) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(14, 165, 233, ${0.4 - i * 0.1})`;
                    ctx.lineWidth = 2;
                    for (let x = 0; x < canvas.width; x++) {
                        const y = canvas.height / 2 + Math.sin(x * 0.02 + time + i) * 30;
                        if (x === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.stroke();
                }
                animationId = requestAnimationFrame(animate);
            };
            animate();
        }

        // Grid
        else if (type === 'grid') {
            let time = 0;
            const spacing = 40;
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                time += 0.01;
                ctx.strokeStyle = 'rgba(59, 130, 246, 0.2)';
                ctx.lineWidth = 1;
                for (let x = 0; x < canvas.width; x += spacing) {
                    const offset = Math.sin(time + x * 0.01) * 10;
                    ctx.beginPath();
                    ctx.moveTo(x + offset, 0);
                    ctx.lineTo(x + offset, canvas.height);
                    ctx.stroke();
                }
                for (let y = 0; y < canvas.height; y += spacing) {
                    const offset = Math.cos(time + y * 0.01) * 10;
                    ctx.beginPath();
                    ctx.moveTo(0, y + offset);
                    ctx.lineTo(canvas.width, y + offset);
                    ctx.stroke();
                }
                animationId = requestAnimationFrame(animate);
            };
            animate();
        }

        // DNA Helix
        else if (type === 'dna') {
            let time = 0;
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                time += 0.02;
                const centerX = canvas.width / 2;
                for (let i = 0; i < 100; i++) {
                    const y = (i / 100) * canvas.height;
                    const offset = Math.sin(time + i * 0.2) * 40;
                    const radius = 3;

                    ctx.beginPath();
                    ctx.fillStyle = '#10b981';
                    ctx.arc(centerX + offset, y, radius, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.beginPath();
                    ctx.fillStyle = '#3b82f6';
                    ctx.arc(centerX - offset, y, radius, 0, Math.PI * 2);
                    ctx.fill();

                    if (i % 5 === 0) {
                        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
                        ctx.beginPath();
                        ctx.moveTo(centerX + offset, y);
                        ctx.lineTo(centerX - offset, y);
                        ctx.stroke();
                    }
                }
                animationId = requestAnimationFrame(animate);
            };
            animate();
        }

        // Network
        else if (type === 'network') {
            const nodes = Array.from({ length: 40 }, () => ({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
            }));
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                nodes.forEach(n => {
                    n.x += n.vx;
                    n.y += n.vy;
                    if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
                    if (n.y < 0 || n.y > canvas.height) n.vy *= -1;

                    ctx.beginPath();
                    ctx.fillStyle = '#6366f1';
                    ctx.arc(n.x, n.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                });

                nodes.forEach((n1, i) => {
                    nodes.slice(i + 1).forEach(n2 => {
                        const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                        if (dist < 120) {
                            ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 * (1 - dist / 120)})`;
                            ctx.beginPath();
                            ctx.moveTo(n1.x, n1.y);
                            ctx.lineTo(n2.x, n2.y);
                            ctx.stroke();
                        }
                    });
                });
                animationId = requestAnimationFrame(animate);
            };
            animate();
        }

        // Sparkles
        else if (type === 'sparkles') {
            for (let i = 0; i < 60; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    life: Math.random() * 100,
                    speed: Math.random() * 0.5 + 0.2
                });
            }
            const animate = () => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                particles.forEach(p => {
                    p.life += p.speed;
                    if (p.life > 100) p.life = 0;
                    const alpha = p.life < 50 ? p.life / 50 : (100 - p.life) / 50;
                    ctx.fillStyle = `rgba(251, 191, 36, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                    ctx.fill();
                });
                animationId = requestAnimationFrame(animate);
            };
            animate();
        }

        return () => {
            if (animationId) cancelAnimationFrame(animationId);
        };
    }, [type, isActive]);

    return <canvas ref={canvasRef} className="w-full h-full" />;
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

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop - Light */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/10 backdrop-blur-md"
                    />

                    {/* Modal Card - Glassmorphism White */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-4xl bg-white/80 border border-white/40 rounded-[40px] overflow-hidden shadow-2xl flex flex-col md:flex-row h-auto md:h-[500px] backdrop-blur-2xl"
                        style={{
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255,255,255,0.5) inset',
                            background: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))'
                        }}
                    >
                        {/* Animation Section */}
                        <div className="relative w-full md:w-1/2 h-[280px] md:h-full bg-gradient-to-br from-indigo-50/50 to-purple-50/50 flex items-center justify-center overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentIndex}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4 }}
                                    className="absolute inset-0"
                                >
                                    <SlideAnimation
                                        type={slides[currentIndex].animationType}
                                        isActive={isOpen}
                                    />
                                </motion.div>
                            </AnimatePresence>

                            {/* Audio Visualizer */}
                            {isPlaying && !isMuted && (
                                <div className="absolute bottom-6 left-6 flex gap-1.5 items-end h-12">
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
                                className="absolute top-6 right-6 p-2.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
                            >
                                <X size={22} />
                            </button>

                            {/* Text Content */}
                            <div className="flex-1 flex flex-col justify-center mt-4 md:mt-0">
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
