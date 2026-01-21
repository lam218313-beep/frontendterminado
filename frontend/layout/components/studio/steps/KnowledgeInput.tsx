import React, { useEffect, useState } from 'react';
import { useStudio } from '../../../contexts/StudioContext';
import { ToggleCard } from '../ui/ToggleCard';
import { getClients, Client, API_BASE_URL } from '../../../services/api';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const KnowledgeInput: React.FC = () => {
    const { state, dispatch } = useStudio();
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoadingClients, setIsLoadingClients] = useState(true);
    const [isLoadingContext, setIsLoadingContext] = useState(false);

    // Fetch clients on mount
    useEffect(() => {
        const loadClients = async () => {
            try {
                const data = await getClients();
                setClients(data);
            } catch (error) {
                console.error("Failed to load clients", error);
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
                // Assuming we add a method to api.ts for this new endpoint
                // TEMPORARY DIRECT FETCH until api.ts is updated
                // TEMPORARY DIRECT FETCH until api.ts is updated
                const token = localStorage.getItem('pixely_access_token'); // Use correct token key
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
            className="space-y-8 pb-20"
        >
            {/* INTRO */}
            <div className="space-y-2">
                <h2 className="text-3xl font-bold text-white">Configuración del Contexto</h2>
                <p className="text-gray-400 max-w-2xl">
                    Selecciona el cliente y define qué información debe conocer la IA antes de generar.
                    Activa o desactiva los bloques de información según sea necesario.
                </p>
            </div>

            {/* CLIENT SELECTOR */}
            <div className="max-w-md bg-white/5 p-6 rounded-2xl border border-white/10">
                <label className="block text-sm font-medium text-gray-300 mb-2">Cliente Activo</label>
                {isLoadingClients ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                        <Loader2 className="animate-spin w-4 h-4" /> Cargando clientes...
                    </div>
                ) : (
                    <select
                        value={state.clientId}
                        onChange={handleClientChange}
                        className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all placeholder-gray-500"
                    >
                        <option value="">-- Seleccionar Cliente --</option>
                        {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.nombre}</option>
                        ))}
                    </select>
                )}
            </div>

            {state.clientId && (
                <>
                    {isLoadingContext ? (
                        <div className="h-40 flex flex-col items-center justify-center text-gray-400 gap-3 border border-dashed border-white/10 rounded-2xl">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            <p>Analizando cerebro de la marca...</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* COLUMN 1: INTERVIEW */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-indigo-400 font-semibold uppercase text-xs tracking-wider">
                                    <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                                    Datos de Ficha
                                </div>

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
                                    <div className="p-4 bg-white/5 rounded-xl text-sm text-gray-500 flex items-center gap-2">
                                        <AlertCircle size={16} /> No hay datos de entrevista disponibles.
                                    </div>
                                )}
                            </div>

                            {/* COLUMN 2: STRATEGY */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 text-emerald-400 font-semibold uppercase text-xs tracking-wider">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    Estrategia & Pilares
                                </div>

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
                                    <div className="p-4 bg-white/5 rounded-xl text-sm text-gray-500 flex items-center gap-2">
                                        <AlertCircle size={16} /> No hay análisis estratégico disponible.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* MANUAL INPUT */}
                    <div className="pt-6 border-t border-white/10">
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            <span className="text-indigo-400">Contexto Adicional</span> (Opcional)
                        </label>
                        <textarea
                            value={state.customContext}
                            onChange={(e) => dispatch({ type: 'SET_CUSTOM_CONTEXT', payload: e.target.value })}
                            placeholder="Añade detalles específicos que no estén en la ficha (ej: 'Campaña de verano 2026', 'Evitar color rojo')..."
                            className="w-full h-32 bg-black/20 border border-white/10 rounded-xl p-4 text-white resize-none focus:ring-1 focus:ring-indigo-500 outline-none placeholder-gray-600"
                        />
                    </div>

                    {/* ACTION BAR */}
                    <div className="fixed bottom-0 left-0 w-full bg-[#1A1A1A] border-t border-white/10 p-4 z-50">
                        <div className="max-w-6xl mx-auto flex justify-end">
                            <button
                                onClick={() => dispatch({ type: 'NEXT_STEP' })}
                                disabled={!state.clientId}
                                className={`
                                    flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-all
                                    ${state.clientId
                                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg hover:shadow-indigo-500/25 active:scale-95'
                                        : 'bg-white/5 text-gray-500 cursor-not-allowed'}
                                `}
                            >
                                Siguiente: Estrategia <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </motion.div>
    );
};
