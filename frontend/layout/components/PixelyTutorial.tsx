import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Volume2, VolumeX, ChevronRight, ChevronLeft, SkipForward,
    BarChart3, Target, Calendar, CheckCircle2, Gift,
    BrainCircuit, MessageSquare, ArrowRight, Layers, Lock, Unlock,
    Sparkles, Zap, PieChart, TrendingUp, Users, Activity, ScanFace,
    Building2, Globe, Rocket, Check, ShieldCheck, Fingerprint,
    Heart, X, Crown, ImageIcon, FileText, Image as ImageIconLucide
} from 'lucide-react';
import confetti from 'canvas-confetti';

// --- VISUAL COMPONENTS FOR SLIDES (LOOPING ANIMATIONS) ---

// 1. WELCOME: CLOUD LOOP (SMOOTHER)
const VisualWelcome = () => {
    return (
        <div className="relative flex items-center justify-center w-full h-[500px]">
            {/* Organic Cloud Background Loop - Slower and smoother */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 10, 0],
                        x: [0, 30, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[500px] h-[500px] bg-gradient-to-r from-primary-200/40 to-accent-200/40 rounded-full blur-[100px] absolute -top-20 -left-20"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        x: [0, -40, 0],
                        y: [0, 20, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[450px] h-[450px] bg-gradient-to-l from-blue-200/40 to-purple-200/40 rounded-full blur-[100px] absolute bottom-0 right-0"
                />
            </div>

            {/* Content Floating Loop - Subtle Entry */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="z-10"
            >
                <motion.div
                    animate={{ y: [0, -15, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    className="flex flex-col items-center glass-card px-16 py-12 rounded-[40px]"
                >
                    <div
                        className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/20 mb-8"
                    >
                        <Sparkles className="text-white w-10 h-10" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-6xl md:text-8xl font-display font-extrabold text-center tracking-tight text-slate-800">
                        Pixely<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-accent-500">.</span>
                    </h1>
                    <p className="text-slate-500 mt-4 font-medium tracking-wide text-lg uppercase">Partners Workspace</p>
                </motion.div>
            </motion.div>
        </div>
    );
};

// 2. INTRO: CONNECTED FLOATING CARDS (LOOP)
const VisualIntro = () => (
    <div className="flex items-center justify-center gap-4 md:gap-12 h-[450px] w-full relative">
        {/* Connecting Line Pulse */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-2 bg-slate-200 rounded-full overflow-hidden z-0">
            <motion.div
                animate={{ x: ["-100%", "100%"] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-full h-full bg-gradient-to-r from-transparent via-primary-400 to-transparent"
            />
        </div>

        {/* Card 1: AI (Floats Up) */}
        <motion.div
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="w-64 h-64 rounded-[40px] glass-card flex flex-col items-center justify-center relative z-10 bg-white/60"
        >
            <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mb-4"
            >
                <BrainCircuit size={40} strokeWidth={1.5} />
            </motion.div>
            <span className="text-xl font-display font-bold text-slate-700">Diagnóstico</span>
        </motion.div>

        {/* Card 2: Brand (Floats Down - Counter phase) */}
        <motion.div
            animate={{ y: [0, 20, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            className="w-64 h-64 rounded-[40px] glass-card flex flex-col items-center justify-center border-2 border-primary-100 z-10 bg-white/80"
        >
            <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                className="w-20 h-20 bg-accent-100 rounded-2xl flex items-center justify-center text-accent-600 mb-4"
            >
                <ScanFace size={40} strokeWidth={1.5} />
            </motion.div>
            <span className="text-xl font-display font-bold text-slate-700">Tu Marca</span>
        </motion.div>
    </div>
);

// 3. WORKFLOW: BRAND COLORS (UPDATED)
const VisualWorkflow = () => {
    const steps = [
        { icon: MessageSquare, label: "Entrevista" },
        { icon: BarChart3, label: "Análisis" },
        { icon: Target, label: "Estrategia" },
        { icon: Calendar, label: "Plan" },
        { icon: CheckCircle2, label: "Validación" },
        { icon: Gift, label: "Beneficios" }
    ];

    return (
        <div className="w-full max-w-5xl flex flex-col justify-center h-[400px]">
            <div className="grid grid-cols-6 gap-6 relative">
                {/* Connecting Line */}
                <div className="absolute top-12 left-0 w-full h-1 bg-slate-200 -z-10 rounded-full"></div>

                {steps.map((s, i) => (
                    <div key={i} className="flex flex-col items-center gap-4 relative">
                        <motion.div
                            animate={{
                                scale: [1, 1.1, 1],
                                borderColor: ["rgba(255,255,255,0.8)", "#ec4899", "rgba(255,255,255,0.8)"],
                                backgroundColor: ["rgba(255,255,255,0.65)", "#fff0f6", "rgba(255,255,255,0.65)"]
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                delay: i * 0.5, // Sequential pulse
                                ease: "easeInOut"
                            }}
                            className="w-24 h-24 rounded-[30px] glass-card flex items-center justify-center border-2"
                        >
                            {/* Brand Color Text (Fixed Visibility) */}
                            <div className="text-primary-600">
                                <s.icon size={32} strokeWidth={2} />
                            </div>
                        </motion.div>
                        <span className="text-sm font-bold text-slate-500">{s.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// 4. STEP 1: ANIMATED FORM (UPDATED)
const VisualStep1 = () => {
    const fields = [
        { label: "Nombre de la Empresa", value: "TechNova Inc.", icon: Building2 },
        { label: "Industria / Nicho", value: "SaaS & IA", icon: Globe },
        { label: "Objetivo Principal", value: "Liderar el mercado LATAM", icon: Rocket },
    ];

    return (
        <div className="w-full max-w-lg glass-card rounded-[40px] p-8 shadow-2xl h-[400px] flex flex-col justify-center relative">
            <div className="absolute top-6 right-6">
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
            </div>

            <h3 className="text-2xl font-display font-bold text-slate-800 mb-6">Perfil de Marca</h3>

            <div className="space-y-6">
                {fields.map((f, i) => (
                    <div key={i} className="space-y-2">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                            <f.icon size={12} /> {f.label}
                        </label>
                        <div className="h-12 bg-white/60 border border-slate-200 rounded-xl px-4 flex items-center shadow-inner">
                            <motion.span
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: "auto", opacity: 1 }}
                                transition={{
                                    duration: 1.5,
                                    delay: i * 1.5, // Sequential typing
                                    ease: "easeOut"
                                }}
                                className="text-slate-700 font-medium overflow-hidden whitespace-nowrap border-r-2 border-primary-500 pr-1"
                            >
                                {f.value}
                            </motion.span>
                        </div>
                    </div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 5 }}
                className="mt-6 w-full py-3 bg-gradient-to-r from-primary-500 to-accent-600 rounded-xl text-white font-bold text-center shadow-lg"
            >
                Procesando Información...
            </motion.div>
        </div>
    );
};

// 5. STEP 2: DASHBOARD COLORS (UPDATED: Green, Yellow, Red, Orange)
const VisualStep2 = () => (
    <div className="w-full max-w-5xl h-[450px] flex items-center justify-center">
        <div className="w-full h-full grid grid-cols-1 md:grid-cols-3 grid-rows-2 gap-4 p-2">

            {/* Widget 1: Main Bar Chart - ONLY REQUESTED COLORS */}
            <div className="col-span-2 row-span-2 glass-card rounded-[32px] p-6 flex flex-col relative overflow-hidden bg-white/60">
                <div className="flex justify-between items-center mb-6 z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-slate-50 rounded-xl text-slate-500"><BarChart3 size={20} /></div>
                        <div>
                            <h4 className="font-bold text-slate-700 leading-tight">Métricas Clave</h4>
                            <p className="text-xs text-slate-400">Rendimiento Mensual</p>
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex items-end justify-between gap-3 px-2 z-10 pb-2">
                    {/* Using exclusively: emerald(green), amber(yellow), rose(red), orange */}
                    {[
                        { h: 40, c: 'bg-emerald-400' },
                        { h: 65, c: 'bg-amber-400' },
                        { h: 45, c: 'bg-rose-400' },
                        { h: 90, c: 'bg-emerald-500' },
                        { h: 60, c: 'bg-orange-400' },
                        { h: 75, c: 'bg-amber-500' },
                        { h: 50, c: 'bg-rose-400' },
                        { h: 80, c: 'bg-emerald-400' },
                        { h: 55, c: 'bg-orange-500' },
                        { h: 70, c: 'bg-amber-400' }
                    ].map((bar, i) => (
                        <motion.div
                            key={i}
                            animate={{
                                height: [`${bar.h}%`, `${bar.h + (Math.random() * 20 - 10)}%`, `${bar.h}%`],
                            }}
                            transition={{
                                duration: 3 + Math.random(),
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: i * 0.1
                            }}
                            className={`w-full rounded-t-md shadow-sm opacity-90 ${bar.c}`}
                        />
                    ))}
                </div>
            </div>

            {/* Widget 2: Donut Chart - Green/Yellow/Orange/Red */}
            <div className="glass-card rounded-[32px] p-5 flex flex-col items-center justify-center relative overflow-hidden bg-white/60">
                <div className="w-full flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Salud</span>
                    <Activity size={14} className="text-emerald-500" />
                </div>

                <div className="relative w-28 h-28 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        {/* Background */}
                        <circle cx="50" cy="50" r="42" stroke="#f1f5f9" strokeWidth="8" fill="none" />
                        {/* Segments */}
                        <motion.circle cx="50" cy="50" r="42" stroke="#fbbf24" strokeWidth="8" fill="none" strokeDasharray="60 200" strokeDashoffset="0" /> {/* Yellow */}
                        <motion.circle cx="50" cy="50" r="42" stroke="#34d399" strokeWidth="8" fill="none" strokeDasharray="120 200" strokeDashoffset="-60" /> {/* Green */}
                        <motion.circle cx="50" cy="50" r="42" stroke="#f87171" strokeWidth="8" fill="none" strokeDasharray="30 200" strokeDashoffset="-180" /> {/* Red */}
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold text-slate-800">A+</span>
                    </div>
                </div>
            </div>

            {/* Widget 3: Sparkline - Orange */}
            <div className="glass-card rounded-[32px] p-5 flex flex-col justify-between relative overflow-hidden bg-white/60">
                <div className="flex justify-between items-start">
                    <div>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Conversión</span>
                        <span className="text-2xl font-bold text-slate-800">4.5%</span>
                    </div>
                    <div className="p-1.5 bg-orange-100 rounded-lg text-orange-600">
                        <TrendingUp size={16} />
                    </div>
                </div>

                <div className="h-16 w-full relative">
                    <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                        <defs>
                            <linearGradient id="trendGradientOrange" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#f97316" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <path d="M0,40 L0,20 L20,28 L40,15 L60,22 L80,10 L100,18 L100,40 Z" fill="url(#trendGradientOrange)" />
                        <motion.path
                            d="M0,20 L20,28 L40,15 L60,22 L80,10 L100,18"
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            animate={{
                                d: [
                                    "M0,20 L20,28 L40,15 L60,22 L80,10 L100,18",
                                    "M0,25 L20,18 L40,22 L60,12 L80,15 L100,8",
                                    "M0,20 L20,28 L40,15 L60,22 L80,10 L100,18"
                                ]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </svg>
                </div>
            </div>

        </div>
    </div>
);

// 6. STEP 3: ORBIT (UPDATED: PIXELY LOGO CENTER, FIXED CARD)
const VisualStep3 = () => (
    <div className="w-full h-[400px] flex items-center justify-center relative">
        {/* Center: Pixely Logo */}
        <motion.div
            animate={{ scale: [1, 1.05, 1], boxShadow: ["0 0 0px rgba(236, 72, 153, 0)", "0 0 30px rgba(236, 72, 153, 0.2)", "0 0 0px rgba(236, 72, 153, 0)"] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-32 h-32 bg-white rounded-full z-20 flex items-center justify-center relative shadow-xl border-4 border-primary-50"
        >
            <div className="flex flex-col items-center">
                <span className="text-2xl font-display font-extrabold text-slate-800">Pixely</span>
                <div className="w-8 h-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full mt-1"></div>
            </div>
        </motion.div>

        {/* Orbit Path */}
        <div className="absolute w-[340px] h-[340px] rounded-full border border-dashed border-slate-300 opacity-60"></div>

        {/* Orbiting Elements Container */}
        <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute w-[340px] h-[340px] pointer-events-none"
        >
            {/* Card 1 */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white glass-card rounded-2xl shadow-lg flex flex-col items-center justify-center p-2">
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex flex-col items-center">
                    <Users size={24} className="text-purple-500 mb-1" />
                    <span className="text-[10px] font-bold text-slate-600">Audiencia</span>
                </motion.div>
            </div>

            {/* Card 2 */}
            <div className="absolute bottom-[15%] right-[2%] w-20 h-20 bg-white glass-card rounded-2xl shadow-lg flex flex-col items-center justify-center p-2">
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex flex-col items-center">
                    <TrendingUp size={24} className="text-green-500 mb-1" />
                    <span className="text-[10px] font-bold text-slate-600">Trends</span>
                </motion.div>
            </div>

            {/* Card 3 (Fixed static issue by adding to rotation container) */}
            <div className="absolute bottom-[15%] left-[2%] w-20 h-20 bg-white glass-card rounded-2xl shadow-lg flex flex-col items-center justify-center p-2">
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="flex flex-col items-center">
                    <MessageSquare size={24} className="text-orange-500 mb-1" />
                    <span className="text-[10px] font-bold text-slate-600">Canales</span>
                </motion.div>
            </div>
        </motion.div>
    </div>
);

// 7. STEP 4: PLANNING (NEW: CONTENT TIMELINE)
const VisualStep4 = () => {
    return (
        <div className="w-full max-w-lg h-[400px] flex items-center justify-center p-4">
            <div className="relative w-full max-w-sm ml-8">
                {/* Vertical Timeline Line */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-100 rounded-full"></div>

                <div className="flex flex-col gap-6">
                    {/* Item 1: Scheduled */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="relative pl-8"
                    >
                        {/* Dot */}
                        <div className="absolute left-[-5px] top-4 w-3.5 h-3.5 bg-green-500 rounded-full ring-4 ring-white shadow-sm z-10"></div>

                        {/* Card */}
                        <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                                <ImageIconLucide size={18} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hoy, 10:00 AM</div>
                                <div className="text-slate-700 font-bold">Lanzamiento Producto</div>
                            </div>
                            <div className="ml-auto">
                                <CheckCircle2 size={16} className="text-green-500" />
                            </div>
                        </div>
                    </motion.div>

                    {/* Item 2: Pending */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="relative pl-8"
                    >
                        {/* Dot */}
                        <div className="absolute left-[-5px] top-4 w-3.5 h-3.5 bg-amber-400 rounded-full ring-4 ring-white shadow-sm z-10"></div>

                        {/* Card */}
                        <div className="bg-white/80 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-500 flex items-center justify-center shrink-0">
                                <FileText size={18} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mañana, 03:00 PM</div>
                                <div className="text-slate-700 font-bold">Blog Post Semanal</div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Item 3: Draft */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 1.0 }}
                        className="relative pl-8"
                    >
                        {/* Dot */}
                        <div className="absolute left-[-5px] top-4 w-3.5 h-3.5 bg-slate-300 rounded-full ring-4 ring-white shadow-sm z-10"></div>

                        {/* Card */}
                        <div className="bg-white/60 p-4 rounded-2xl border border-dashed border-slate-200 flex items-center gap-4 opacity-70">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                                <Calendar size={18} />
                            </div>
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Viernes, 09:00 AM</div>
                                <div className="text-slate-600 font-bold">Newsletter</div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

// 8. STEP 5: VALIDATION (NEW: POST PREVIEW)
const VisualStep5 = () => (
    <div className="flex flex-col justify-center h-[400px] items-center w-full gap-8">
        {/* Post Preview Card */}
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden relative z-10"
        >
            {/* Header */}
            <div className="p-3 flex items-center gap-3 border-b border-slate-50">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary-400 to-accent-400"></div>
                <div>
                    <div className="h-2 w-24 bg-slate-200 rounded-full mb-1"></div>
                    <div className="h-1.5 w-16 bg-slate-100 rounded-full"></div>
                </div>
            </div>

            {/* Content Area */}
            <div className="aspect-square bg-slate-50 flex items-center justify-center relative group">
                <ImageIcon size={48} className="text-slate-200" />
            </div>

            {/* Actions Footer */}
            <div className="p-3">
                <div className="flex gap-3 mb-3 text-slate-300">
                    <Heart size={20} />
                    <MessageSquare size={20} />
                    <Gift size={20} />
                </div>
                <div className="space-y-2">
                    <div className="h-2 w-full bg-slate-100 rounded-full"></div>
                    <div className="h-2 w-2/3 bg-slate-100 rounded-full"></div>
                </div>
            </div>
        </motion.div>

        {/* Review Controls */}
        <div className="flex items-center gap-12">
            <button className="w-14 h-14 rounded-full bg-white border border-slate-200 text-slate-300 flex items-center justify-center cursor-not-allowed">
                <X size={24} strokeWidth={2.5} />
            </button>
            <motion.button
                animate={{ boxShadow: ["0 0 0 0px rgba(34, 197, 94, 0)", "0 0 0 6px rgba(34, 197, 94, 0.2)", "0 0 0 0px rgba(34, 197, 94, 0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 text-white flex items-center justify-center shadow-xl shadow-green-500/30"
            >
                <Check size={36} strokeWidth={3} />
            </motion.button>
        </div>
    </div>
);

// 9. STEP 6: BENEFITS (UPDATED: TRANSLATED TEXT)
const VisualStep6 = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-4xl">
        {[
            { label: "Redacción", icon: Sparkles },
            { label: "Tendencias", icon: TrendingUp },
            { label: "Competencia", icon: Users },
            { label: "Sentimiento", icon: Activity },
            { label: "Reportes", icon: BarChart3 },
            { label: "NPS", icon: Target }
        ].map((item, i) => (
            <motion.div
                key={i}
                animate={{
                    borderColor: ["rgba(255,255,255,0)", "#ec4899", "rgba(255,255,255,0)"],
                    backgroundColor: ["rgba(255,255,255,0.4)", "rgba(236, 72, 153, 0.1)", "rgba(255,255,255,0.4)"]
                }}
                transition={{ duration: 6, repeat: Infinity, delay: i * 1 }} // Much Slower
                className="h-40 glass-card rounded-[30px] p-6 flex flex-col justify-between border-2 border-transparent"
            >
                <div className="flex justify-between items-start">
                    <div className="p-3 rounded-2xl bg-white text-primary-600 shadow-md">
                        <item.icon size={24} />
                    </div>
                    <motion.div
                        animate={{ opacity: [0, 1, 0] }}
                        transition={{ duration: 6, repeat: Infinity, delay: i * 1 }} // Sync with border
                    >
                        <Unlock size={18} className="text-primary-500" />
                    </motion.div>
                </div>
                <span className="font-bold text-slate-700 text-lg">{item.label}</span>
            </motion.div>
        ))}
    </div>
);

// 10. STEP 7: KANBAN (UPDATED: Z-INDEX FIX)
const VisualStep7 = () => (
    <div className="w-full max-w-5xl flex gap-6 h-[400px] relative">
        {/* Moving Task (Absolute to container to fix Z-Index) */}
        <motion.div
            animate={{
                left: ["16.6%", "50%", "83.3%", "16.6%"], // Centered positions of columns approx
                top: ["25%", "25%", "25%", "25%"],
                opacity: [1, 1, 0, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", times: [0, 0.4, 0.8, 1] }}
            className="absolute w-[28%] bg-white p-5 rounded-[24px] shadow-2xl border border-primary-100 z-50 flex flex-col gap-2 transform -translate-x-1/2"
        >
            <div className="flex justify-between">
                <div className="h-1.5 bg-red-400 rounded-full w-8"></div>
                <div className="w-4 h-4 rounded-full bg-slate-200"></div>
            </div>
            <div className="text-sm font-bold text-slate-700">Lanzamiento Q4</div>
            <div className="h-1.5 bg-slate-100 rounded-full w-full mt-2"></div>
        </motion.div>

        {['Por Hacer', 'En Progreso', 'Listo'].map((col, i) => (
            <div key={col} className="flex-1 glass-panel rounded-[32px] p-4 flex flex-col gap-4 bg-slate-50/50 relative z-0">
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2 mt-2">{col}</div>
                <div className="bg-white/40 p-5 rounded-[24px] border border-white/50 border-dashed h-24"></div>
                <div className="bg-white/40 p-5 rounded-[24px] border border-white/50 border-dashed h-24 opacity-50"></div>
            </div>
        ))}
    </div>
);

// 11. STEP 8: PLAN (NEW: HEADER WIDGET)
const VisualStep8 = () => (
    <div className="flex flex-col items-center justify-center h-[400px]">
        {/* Mock Header Interface */}
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md bg-white rounded-full p-2 pr-6 shadow-2xl border border-slate-100 flex items-center gap-4 relative overflow-hidden"
        >
            {/* User Avatar Group */}
            <div className="flex items-center gap-3 pl-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-white shadow-md"></div>
                <div>
                    <div className="h-2.5 w-24 bg-slate-800 rounded-full mb-1.5"></div>
                    <div className="h-2 w-16 bg-slate-300 rounded-full"></div>
                </div>
            </div>

            <div className="h-8 w-px bg-slate-100 mx-2"></div>

            {/* Plan Badge */}
            <div className="flex items-center gap-2 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                <Crown size={14} className="text-yellow-600" fill="currentColor" />
                <span className="text-xs font-bold text-yellow-700 uppercase tracking-wider">Premium</span>
            </div>

            {/* Credits/Usage Indicator */}
            <div className="ml-auto flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5">
                    <Zap size={12} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-500">CONSUMO</span>
                </div>
                <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "60%" }}
                        transition={{ duration: 1.5, delay: 0.5 }}
                        className="h-full bg-green-500 rounded-full"
                    />
                </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"></div>
        </motion.div>

        {/* Floating Tooltip */}
        <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="mt-8 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-xl relative"
        >
            <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 rotate-45"></div>
            Tu estado actual siempre visible
        </motion.div>
    </div>
);

// 12. STEP 9: FINAL PULSE (UPDATED CONFETTI)
const VisualStep9 = () => {
    useEffect(() => {
        const end = Date.now() + 1000;
        const colors = ['#ec4899', '#8b5cf6', '#ffffff'];

        (function frame() {
            confetti({
                particleCount: 4,
                angle: 60,
                spread: 55,
                origin: { x: 0, y: 0.8 },
                colors: colors
            });
            confetti({
                particleCount: 4,
                angle: 120,
                spread: 55,
                origin: { x: 1, y: 0.8 },
                colors: colors
            });

            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    }, []);

    return (
        <div className="text-center relative h-[400px] flex flex-col items-center justify-center">
            <motion.div
                animate={{ scale: [1, 1.1, 1], boxShadow: ["0 0 0px rgba(34,197,94,0)", "0 0 50px rgba(34,197,94,0.4)", "0 0 0px rgba(34,197,94,0)"] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-green-500 rounded-[40px] flex items-center justify-center mx-auto mb-8 text-white"
            >
                <CheckCircle2 size={64} strokeWidth={2} />
            </motion.div>
            <h2 className="text-4xl font-extrabold mb-4 text-slate-800">¡Todo Listo!</h2>
            <p className="text-slate-500 text-xl max-w-md mx-auto leading-relaxed">
                Tu plataforma de inteligencia de mercado está configurada.
            </p>
        </div>
    );
};

// --- DATA & CONTENT ---

interface SlideContent {
    id: number;
    title: string;
    subtitle?: string;
    narration: string;
    component: React.ReactNode;
}

const slides: SlideContent[] = [
    {
        id: 0,
        title: "Bienvenido",
        narration: "¡Bienvenido a Pixely Partners! Soy tu asistente y estoy aquí para mostrarte cómo nuestra metodología transformará tu estrategia de marketing digital. Descubre el poder de nuestro sistema de diagnóstico.",
        component: <VisualWelcome />
    },
    {
        id: 1,
        title: "¿Qué es Pixely Partners?",
        subtitle: "Una alianza estratégica",
        narration: "Pixely Partners es una alianza bilateral. Nuestra tecnología diagnóstica procesa información de mercado para validar tu marca y minimizar la incertidumbre en cada decisión.",
        component: <VisualIntro />
    },
    {
        id: 2,
        title: "Flujo de Trabajo",
        subtitle: "6 Pasos Metodológicos",
        narration: "Tu jornada sigue una metodología de 6 pasos estratégicos. Cada uno construye sobre el anterior, cimentando una estrategia sólida basada en datos reales de mercado.",
        component: <VisualWorkflow />
    },
    {
        id: 3,
        title: "Paso 1: Entrevista",
        subtitle: "La base de todo",
        narration: "Todo comienza aquí. Nos cuentas sobre tu negocio: historia, productos y objetivos. Nuestro sistema estructura perfiles de cliente ideales y anti-personas basados en comportamiento.",
        component: <VisualStep1 />
    },
    {
        id: 4,
        title: "Paso 2: Análisis",
        subtitle: "Inteligencia de Datos",
        narration: "Analizamos patrones de mercado y redes sociales. Identificamos las emociones de tu audiencia y oportunidades ocultas utilizando modelos estadísticos avanzados.",
        component: <VisualStep2 />
    },
    {
        id: 5,
        title: "Paso 3: Estrategia",
        subtitle: "Hoja de ruta",
        narration: "Convertimos los datos en acción. Aquí definirás la dirección estratégica, mensajes clave y tácticas específicas validadas para alcanzar tus objetivos comerciales.",
        component: <VisualStep3 />
    },
    {
        id: 6,
        title: "Paso 4: Planificación",
        subtitle: "Calendario Inteligente",
        narration: "Del 'qué' al 'cuándo'. Organiza tu calendario de contenido, definiendo la frecuencia y momentos óptimos de publicación para maximizar el alcance orgánico.",
        component: <VisualStep4 />
    },
    {
        id: 7,
        title: "Paso 5: Validación",
        subtitle: "Control de Calidad",
        narration: "Antes de publicar, todo pasa por un estricto control. Revisa, aprueba o solicita cambios. Garantizamos que cada pieza cumpla con los estándares de tu marca.",
        component: <VisualStep5 />
    },
    {
        id: 8,
        title: "Beneficios",
        subtitle: "Ecosistema de Herramientas",
        narration: "Cuanto más tiempo estés con nosotros, accedes a herramientas más avanzadas: redacción persuasiva, análisis comparativo de competencia y proyección de tendencias.",
        component: <VisualStep6 />
    },
    {
        id: 9,
        title: "Gestión de Tareas",
        subtitle: "Organización de Equipo",
        narration: "Mantén tu operación organizada. Nuestra metodología Kanban te permite asignar, priorizar y dar seguimiento al flujo de trabajo desde un solo panel de control.",
        component: <VisualStep7 />
    },
    {
        id: 10,
        title: "Tu Plan",
        subtitle: "Transparencia Total",
        narration: "En tu header siempre verás tu insignia de plan actual y tus accesos disponibles. Si necesitas escalar tu capacidad, tu asesor está a un clic.",
        component: <VisualStep8 />
    },
    {
        id: 11,
        title: "¡Estás Listo!",
        subtitle: "Comencemos",
        narration: "¡Eso es todo! Ahora tienes una metodología probada para transformar tu marketing. ¿Listo para comenzar? Te recomendamos empezar por la Entrevista.",
        component: <VisualStep9 />
    },
];


// --- MAIN COMPONENT ---

export const PixelyTutorial: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    // --- OPTIMIZED BACKEND TTS (EDGE NITRO) ---
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = React.useRef<HTMLAudioElement | null>(null);

    // Fetch audio when slide changes
    useEffect(() => {
        const fetchAudio = async () => {
            if (!isPlaying || isMuted) return;

            try {
                // Determine preferred voice based on previous user input or default
                // Using a neutral Spanish voice that supports methodology-focused tone
                const voice = "es-MX-DaliaNeural";

                const response = await fetch(`${import.meta.env.VITE_API_URL}/tts/generate`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        text: slides[currentSlide].narration,
                        voice: voice
                    })
                });

                if (response.ok) {
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);

                    if (audioUrl) URL.revokeObjectURL(audioUrl); // Cleanup previous
                    setAudioUrl(url);
                }
            } catch (error) {
                console.error("TTS Error:", error);
            }
        };

        fetchAudio();

        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [currentSlide, isPlaying]);

    // Play audio when URL is ready
    useEffect(() => {
        if (audioUrl && !isMuted && audioRef.current) {
            audioRef.current.src = audioUrl;
            audioRef.current.play().catch(e => console.log("Autoplay blocked:", e));
        }
    }, [audioUrl, isMuted]);

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) setCurrentSlide(prev => prev + 1);
    };

    const prevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
        if (audioRef.current) {
            if (!isMuted) audioRef.current.pause();
            else audioRef.current.play().catch(() => { });
        }
    };

    return (
        <div className="w-full h-full flex flex-col relative bg-[#f8fafc] text-slate-800">
            {/* --- AUDIO COMPONENT --- */}
            <audio ref={audioRef} className="hidden" />

            {/* --- ETHEREAL BACKGROUND ORBS --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-primary-200/20 rounded-full blur-[120px] -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-accent-200/20 rounded-full blur-[120px] translate-y-1/2"></div>
            </div>

            {/* --- MAIN STAGE --- */}
            <div className="flex-1 flex flex-col items-center justify-center p-2 md:p-6 relative z-10 overflow-hidden">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
                        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full max-w-6xl flex flex-col items-center h-full justify-center"
                    >
                        {/* Visual Container - SCALED DOWN ON MOBILE & TABLETS */}
                        <div className="w-full flex items-center justify-center transform scale-[0.65] lg:scale-75 xl:scale-100 origin-center transition-transform duration-500 -my-10 lg:-my-6 xl:my-0 flex-shrink-0">
                            {slides[currentSlide].component}
                        </div>

                        {/* Text Content - SMALLER TEXT ON MOBILE/TABLET */}
                        <div className="text-center max-w-3xl space-y-2 xl:space-y-4 px-4 glass-panel rounded-3xl p-4 xl:p-6 shadow-sm bg-white/30 z-20 mt-auto xl:mt-8">
                            {slides[currentSlide].subtitle && (
                                <motion.span
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                    className="text-primary-600 font-bold tracking-widest text-[10px] xl:text-xs uppercase"
                                >
                                    {slides[currentSlide].subtitle}
                                </motion.span>
                            )}
                            <h2 className="text-2xl lg:text-3xl xl:text-5xl font-display font-bold text-slate-800 leading-tight">
                                {slides[currentSlide].title}
                            </h2>
                            <motion.p
                                key={`text-${currentSlide}`}
                                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
                                className="text-sm md:text-xl text-slate-600 font-medium leading-relaxed max-h-[80px] md:max-h-none overflow-y-auto custom-scrollbar"
                            >
                                {slides[currentSlide].narration}
                            </motion.p>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* --- MODERN CONTROLS BAR --- */}
            <div className="w-full p-4 md:px-12 md:py-8 grid grid-cols-3 items-center z-20 relative glass-panel border-t border-white/60 bg-white/40 backdrop-blur-md gap-2 md:gap-4 shrink-0">

                {/* Left: Skip & Progress (Aligned Start) */}
                <div className="flex items-center gap-6 justify-self-center md:justify-self-start">
                    <button
                        onClick={() => setCurrentSlide(slides.length - 1)}
                        className="text-white hover:brightness-110 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 group px-6 py-2 bg-primary-600 rounded-full shadow-lg shadow-primary-600/20"
                    >
                        Saltar <SkipForward size={14} className="group-hover:translate-x-0.5 transition-transform" />
                    </button>
                    <div className="flex gap-1.5 items-center">
                        {slides.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-2 rounded-full transition-all duration-500 ease-out ${idx === currentSlide
                                    ? 'w-10 bg-primary-600 shadow-sm'
                                    : idx < currentSlide
                                        ? 'w-2 bg-slate-300'
                                        : 'w-2 bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Center: Navigation (Aligned Center) */}
                <div className="flex items-center gap-6 justify-self-center">
                    <button
                        onClick={prevSlide}
                        disabled={currentSlide === 0}
                        className="w-14 h-14 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 disabled:opacity-30 disabled:hover:bg-primary-600 transition-all shadow-lg hover:shadow-xl hover:-translate-x-1"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    {currentSlide === slides.length - 1 ? (
                        <button className="h-14 px-10 rounded-full bg-primary-600 text-white font-bold hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center gap-3">
                            Comenzar Entrevista <ArrowRight size={20} />
                        </button>
                    ) : (
                        <button
                            onClick={nextSlide}
                            className="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center hover:bg-primary-700 hover:scale-105 transition-all shadow-xl hover:shadow-2xl shadow-primary-500/30"
                        >
                            <ChevronRight size={32} />
                        </button>
                    )}
                </div>

                {/* Right: Audio Toggle (Aligned End) */}
                <div className="flex justify-self-center md:justify-self-end">
                    <button
                        onClick={toggleMute}
                        className={`p-4 rounded-full border transition-all shadow-sm ${isMuted ? 'border-red-200 text-red-500 bg-red-50' : 'border-slate-200 text-slate-500 bg-white hover:bg-slate-50'}`}
                    >
                        {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
};