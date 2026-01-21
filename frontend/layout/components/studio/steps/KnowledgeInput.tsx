import React, { useEffect, useState } from 'react';
import { useStudio } from '../../../contexts/StudioContext';
import { ToggleCard } from '../ui/ToggleCard';
import { getClients, Client, API_BASE_URL } from '../../../services/api';
import { Loader2, AlertCircle, ArrowRight, UserCircle2, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

export const KnowledgeInput: React.FC = () => {
    const { state, dispatch } = useStudio();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [isLoadingContext, setIsLoadingContext] = useState(false);
    const [clientError, setClientError] = useState<string | null>(null);

    // Fetch clients on mount
    useEffect(() => {
        const loadClients = async () => {
            try {
                const data = await getClients();
                setClients(data);
                if (data.length === 0) {
                    setClientError("No se encontraron clientes asociados a tu cuenta.");
                }
            } catch (error) {
                console.error("Failed to load clients", error);
                setClientError("Error de conexión al cargar clientes.");
            } finally {
                setIsLoadingClients(false);
            }
        };
        loadClients();
    }, []);

    // Fetch context when client changes
    useEffect(() => {
        const loadContext = async () => {
            if (!state.clientId) return;

            setIsLoadingContext(true);
            try {
                const token = localStorage.getItem('pixely_access_token');
                // Use correct full URL from api.ts constants if available, or construct it carefully
                // Ensure API_BASE_URL doesn't end in slash to avoid double slash if needed, 
                // but usually it's fine.
                const response = await fetch(`${API_BASE_URL}/studio/context/${state.clientId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const result = await response.json();

                    // Flatten data for the reducer
                    const interviewBlocks = result.data.interviewBlocks.map((b: any) => ({ ...b, type: 'interview' }));
                    const analysisBlocks = result.data.analysisBlocks.map((b: any) => ({ ...b, type: 'analysis' }));

                    dispatch({
                        type: 'LOAD_CONTEXT_BLOCKS',
                        payload: [...interviewBlocks, ...analysisBlocks]
                    });
                }
            } catch (error) {
                console.error("Failed to load context", error);
            } finally {
                setIsLoadingContext(false);
            }
        };

        loadContext();
    }, [state.clientId]);

    const handleClientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        dispatch({ type: 'SET_CLIENT', payload: e.target.value });
    };

    // Derived state for rendering
    const interviewBlocks = state.contextBlocks.filter(b => b.type === 'interview');
    const analysisBlocks = state.contextBlocks.filter(b => b.type === 'analysis');

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 pb-24"
        >
            {/* INTRO SECTION */}
            <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-white/50 shadow-xl shadow-indigo-50/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-100/50 to-transparent rounded-bl-full pointer-events-none" />
                <div className="relative z-10">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-3 tracking-tight">
                        Configuración del Contexto
                    </h2>
                    <p className="text-gray-600 max-w-2xl text-lg leading-relaxed">
                        Selecciona el cliente y define qué información estratégica debe conocer la IA antes de diseñar.
                        La calidad del output depende de la calidad del input.
                    </p>
                </div>
            </div>

            {/* CLIENT SELECTOR CARD */}
            <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 shadow-lg shadow-gray-200/50 border border-gray-100 transform transition-all hover:scale-[1.01]">
                <label className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                    <UserCircle2 size={18} className="text-primary-500" />
                    Cliente Activo
                </label>

                {isLoadingClients ? (
                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl text-gray-500">
                        <Loader2 className="animate-spin w-5 h-5 text-primary-500" />
                        <span className="text-sm font-medium">Sincronizando cartera de clientes...</span>
                    </div>
                ) : clientError ? (
                    <div className="flex items-center gap-3 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">{clientError}</span>
                    </div>
                ) : (
                    <div className="relative">
                        <select
                            value={state.clientId}
                            onChange={handleClientChange}
                            className="w-full appearance-none bg-gray-50 hover:bg-white border border-gray-200 hover:border-primary-300 rounded-xl px-5 py-4 text-gray-900 font-semibold focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all cursor-pointer shadow-sm text-base"
                        >
                            <option value="">-- Seleccionar Cliente --</option>
                            {clients.map(c => (
                                <option key={c.id} value={c.id}>{c.nombre}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <ArrowRight size={16} className="rotate-90" />
                        </div>
                    </div>
                )}
            </div>

            {state.clientId && (
                <div className="animate-fade-in-up">
                    {isLoadingContext ? (
                        <div className="h-48 flex flex-col items-center justify-center gap-4 bg-white/40 rounded-3xl border border-dashed border-gray-300">
                            <div className="p-4 bg-white rounded-full shadow-lg">
                                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                            </div>
                            <p className="text-gray-500 font-medium animate-pulse">Analizando cerebro de la marca...</p>
                        </div>
                    ) : (
                        <div className="space-y-8">

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* COLUMN 1: INTERVIEW */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                        <div className="p-1.5 bg-indigo-100 text-indigo-600 rounded-lg">
                                            <UserCircle2 size={16} />
                                        </div>
                                        <h3 className="text-gray-900 font-bold text-lg">Datos de Ficha</h3>
                                    </div>

                                    <div className="space-y-4">
                                        {interviewBlocks.length > 0 ? (
                                            interviewBlocks.map(block => (
                                                <ToggleCard
                                                    key={block.id}
                                                    title={block.label}
                                                    content={block.text}
                                                    isSelected={block.selected}
                                                    onToggle={() => dispatch({ type: 'TOGGLE_BLOCK', payload: { id: block.id } })}
                                                />
                                            ))
                                        ) : (
                                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 flex flex-col items-center text-center gap-3">
                                                <AlertCircle size={32} className="text-gray-300" />
                                                <p className="text-sm">No se encontraron datos de entrevista inicial.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* COLUMN 2: STRATEGY */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                                        <div className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg">
                                            <BrainCircuit size={16} />
                                        </div>
                                        <h3 className="text-gray-900 font-bold text-lg">Estrategia & Pilares</h3>
                                    </div>

                                    <div className="space-y-4">
                                        {analysisBlocks.length > 0 ? (
                                            analysisBlocks.map(block => (
                                                <ToggleCard
                                                    key={block.id}
                                                    title={block.label}
                                                    content={block.text}
                                                    isSelected={block.selected}
                                                    onToggle={() => dispatch({ type: 'TOGGLE_BLOCK', payload: { id: block.id } })}
                                                />
                                            ))
                                        ) : (
                                            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 text-gray-500 flex flex-col items-center text-center gap-3">
                                                <AlertCircle size={32} className="text-gray-300" />
                                                <p className="text-sm">No hay análisis estratégico disponible todavía.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* MANUAL INPUT */}
                            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
                                <label className="block text-sm font-bold text-gray-700 mb-4 flex items-center justify-between">
                                    <span>Contexto Adicional (Prompt System)</span>
                                    <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-1 rounded-md">Opcional</span>
                                </label>
                                <textarea
                                    value={state.customContext}
                                    onChange={(e) => dispatch({ type: 'SET_CUSTOM_CONTEXT', payload: e.target.value })}
                                    placeholder="Escribe aquí cualquier instrucción específica para esta sesión (ej: 'Enfocarse en la campaña de verano', 'Usar un tono más agresivo de lo habitual')..."
                                    className="w-full h-32 bg-gray-50 hover:bg-white border border-gray-200 rounded-2xl p-5 text-gray-800 resize-none focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all placeholder-gray-400 text-base leading-relaxed"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* FLOATING ACTION BAR */}
            <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-lg border-t border-gray-200 p-4 z-50">
                <div className="max-w-7xl mx-auto flex justify-end items-center gap-4">
                    <div className="hidden md:block text-sm text-gray-500 font-medium">
                        {state.clientId && (
                            <span>
                                <strong className="text-primary-600">{interviewBlocks.filter(b => b.selected).length + analysisBlocks.filter(b => b.selected).length}</strong> bloques seleccionados
                            </span>
                        )}
                    </div>
                    <button
                        onClick={() => dispatch({ type: 'NEXT_STEP' })}
                        disabled={!state.clientId}
                        className={`
                            flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-base transition-all shadow-xl
                            ${state.clientId
                                ? 'bg-gradient-to-r from-primary-600 to-indigo-600 text-white hover:shadow-primary-500/30 hover:scale-105 active:scale-95'
                                : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}
                        `}
                    >
                        Siguiente Paso <ArrowRight size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
