import React, { useState, useEffect, useMemo } from 'react';
import {
    Layout,
    List,
    Calendar as CalendarIcon,
    MoreHorizontal,
    Clock,
    User,
    X,
    FileText,
    Play,
    Eye,
    RotateCcw,
    ThumbsUp,
    RefreshCw,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import * as api from '../services/api';
import { useIsMobile } from '../hooks/useMediaQuery';
import { debounce } from '../utils/debounce';


// --- Types & Mock Data ---

type Status = 'todo' | 'in-progress' | 'review' | 'done';
type Priority = 'high' | 'medium' | 'low';

interface Task {
    id: string;
    title: string;
    description: string;
    category: string;
    date: string; // ISO date string YYYY-MM-DD
    status: Status;
    priority: Priority;
    members: string[]; // Initials
    // Phase 1 Enriched Fields (from Planning Module)
    selected_hook?: string;
    narrative_structure?: string;
    key_elements?: string[];
    dos?: string[];
    donts?: string[];
    strategic_purpose?: string;
    copy_suggestion?: string;
    format?: string;
}

// Map Backend Status to Frontend Status
const mapStatusFromBackend = (status: string): Status => {
    switch (status) {
        case 'PENDIENTE': return 'todo';
        case 'EN_CURSO': return 'in-progress';
        case 'REVISADO': return 'review';
        case 'HECHO': return 'done';
        default: return 'todo';
    }
};

const mapStatusToBackend = (status: Status): string => {
    switch (status) {
        case 'todo': return 'PENDIENTE';
        case 'in-progress': return 'EN_CURSO';
        case 'review': return 'REVISADO';
        case 'done': return 'HECHO';
        default: return 'PENDIENTE';
    }
};

const mapPriorityFromBackend = (p: string | undefined): Priority => {
    if (!p) return 'medium';
    const lower = p.toLowerCase();
    if (lower === 'alta' || lower === 'high') return 'high';
    if (lower === 'baja' || lower === 'low') return 'low';
    return 'medium';
};

const COLUMNS: { id: Status; label: string; color: string; badge: string }[] = [
    { id: 'todo', label: 'Por Hacer', color: 'bg-gray-200', badge: 'bg-gray-100 text-gray-600' },
    { id: 'in-progress', label: 'En Progreso', color: 'bg-primary-500', badge: 'bg-primary-50 text-primary-600' },
    { id: 'review', label: 'En Revisión', color: 'bg-purple-500', badge: 'bg-purple-50 text-purple-600' },
    { id: 'done', label: 'Completado', color: 'bg-chart-green', badge: 'bg-green-50 text-green-700' },
];

const PRIORITY_COLORS: Record<Priority, string> = {
    high: 'text-chart-red bg-chart-red/10 border-chart-red/20',
    medium: 'text-chart-yellow bg-chart-yellow/10 border-chart-yellow/20',
    low: 'text-chart-blue bg-chart-blue/10 border-chart-blue/20',
};

// --- Sub-Components ---

const MemberStack: React.FC<{ members: string[] }> = ({ members }) => (
    <div className="flex -space-x-2">
        {members.map((m, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[9px] font-bold text-gray-600 shadow-sm">
                {m}
            </div>
        ))}
    </div>
);

const TaskCard: React.FC<{
    task: Task;
    onClick: (t: Task) => void;
    onDragStart: (e: React.DragEvent, id: string) => void;
    onDragEnd: () => void;
    isDragging: boolean;
}> = React.memo(({ task, onClick, onDragStart, onDragEnd, isDragging }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, task.id)}
        onDragEnd={onDragEnd}
        onClick={() => onClick(task)}
        className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all cursor-grab active:cursor-grabbing group select-none
        ${isDragging ? 'opacity-40 grayscale shadow-none border-dashed border-gray-300' : 'opacity-100'}
    `}
    >
        <div className="flex justify-between items-start mb-2">
            <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-bold uppercase tracking-wide border ${PRIORITY_COLORS[task.priority]}`}>
                {task.category}
            </span>
            <button
                className="text-gray-300 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => { e.stopPropagation(); }}
                aria-label="Opciones"
            >
                <MoreHorizontal size={16} />
            </button>
        </div>
        <h4
            className="text-sm font-bold text-gray-800 mb-1 leading-tight line-clamp-2"
            title={task.title}
        >
            {task.title}
        </h4>
        <p className="text-xs text-gray-400 line-clamp-2 mb-3 leading-relaxed">
            {task.description}
        </p>
        <div className="flex justify-between items-center border-t border-gray-50 pt-3">
            <div className="flex items-center gap-1.5 text-gray-400">
                <Clock size={12} />
                <span className="text-[10px] sm:text-xs font-medium">
                    {task.date ? new Date(task.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Sin fecha'}
                </span>
            </div>
            <MemberStack members={task.members} />
        </div>
    </div>
), (prevProps, nextProps) => {
    // Custom comparison: only re-render if these specific props change
    return (
        prevProps.task.id === nextProps.task.id &&
        prevProps.task.title === nextProps.task.title &&
        prevProps.task.description === nextProps.task.description &&
        prevProps.task.status === nextProps.task.status &&
        prevProps.task.priority === nextProps.task.priority &&
        prevProps.task.category === nextProps.task.category &&
        prevProps.task.date === nextProps.task.date &&
        prevProps.isDragging === nextProps.isDragging &&
        JSON.stringify(prevProps.task.members) === JSON.stringify(nextProps.task.members)
    );
});

// --- Modals ---

const TaskDetailModal: React.FC<{ task: Task; onClose: () => void; updateTaskStatus: (id: string, status: Status) => void }> = ({ task, onClose, updateTaskStatus }) => {
    // Close modal on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-start justify-center bg-gray-900/40 backdrop-blur-sm p-4 sm:p-6 pt-12"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="task-modal-title"
        >
            <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-[95vw] sm:max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header - Sticky */}
                <div className="flex justify-between items-start p-4 sm:p-6 border-b border-gray-100 bg-gray-50/50 shrink-0">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${PRIORITY_COLORS[task.priority]}`}>
                                {task.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${COLUMNS.find(c => c.id === task.status)?.badge}`}>
                                {COLUMNS.find(c => c.id === task.status)?.label}
                            </span>
                        </div>
                        <h2
                            className="text-lg sm:text-xl font-bold text-gray-900 break-words"
                            id="task-modal-title"
                        >{task.title}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors ml-2 shrink-0"
                        aria-label="Cerrar modal"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto flex-1">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <FileText size={16} /> Descripción
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                            {task.description}
                        </p>
                    </div>

                    {/* Strategic Purpose */}
                    {task.strategic_purpose && (
                        <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-purple-700 mb-2">
                                🎯 Propósito Estratégico
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed bg-purple-50/50 p-3 sm:p-4 rounded-xl border border-purple-100">
                                {task.strategic_purpose}
                            </p>
                        </div>
                    )}

                    {/* Selected Hook */}
                    {task.selected_hook && (
                        <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-pink-700 mb-2">
                                💡 Hook Creativo
                            </div>
                            <p className="text-sm text-gray-700 italic leading-relaxed bg-pink-50/50 p-3 sm:p-4 rounded-xl border border-pink-100">
                                "{task.selected_hook}"
                            </p>
                        </div>
                    )}

                    {/* Key Elements */}
                    {task.key_elements && task.key_elements.length > 0 && (
                        <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-blue-700 mb-2">
                                ✓ Elementos Clave
                            </div>
                            <ul className="space-y-2 bg-blue-50/50 p-3 sm:p-4 rounded-xl border border-blue-100">
                                {task.key_elements.map((el, i) => (
                                    <li key={i} className="text-sm text-gray-700 pl-4 relative before:content-['✓'] before:absolute before:left-0 before:text-green-500 before:font-bold">
                                        {el}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Narrative Structure */}
                    {task.narrative_structure && (
                        <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-indigo-700 mb-2">
                                📋 Estructura Narrativa
                            </div>
                            <p className="text-sm text-gray-700 leading-relaxed bg-indigo-50/50 p-3 sm:p-4 rounded-xl border border-indigo-100">
                                {task.narrative_structure}
                            </p>
                        </div>
                    )}

                    {/* Dos and Don'ts - Responsive Grid */}
                    {(task.dos && task.dos.length > 0) || (task.donts && task.donts.length > 0) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {task.dos && task.dos.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-green-700 mb-2">
                                        ✅ Hacer
                                    </div>
                                    <ul className="space-y-1.5 bg-green-50/50 p-3 rounded-xl border border-green-100">
                                        {task.dos.map((item, i) => (
                                            <li key={i} className="text-sm text-gray-700 leading-snug">• {item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {task.donts && task.donts.length > 0 && (
                                <div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-red-700 mb-2">
                                        ❌ Evitar
                                    </div>
                                    <ul className="space-y-1.5 bg-red-50/50 p-3 rounded-xl border border-red-100">
                                        {task.donts.map((item, i) => (
                                            <li key={i} className="text-sm text-gray-700 leading-snug">• {item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    ) : null}

                    {/* Copy Suggestion */}
                    {task.copy_suggestion && (
                        <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                💬 Copy Sugerido
                            </div>
                            <p className="text-sm text-gray-600 italic leading-relaxed bg-gray-50 p-3 sm:p-4 rounded-xl border border-gray-100">
                                "{task.copy_suggestion}"
                            </p>
                        </div>
                    )}

                    {/* Metadata - Responsive Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                <Clock size={16} /> Fecha Límite
                            </div>
                            <div className="text-sm text-gray-600">
                                {task.date ? new Date(task.date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Sin fecha'}
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                <User size={16} /> Asignado a
                            </div>
                            <MemberStack members={task.members} />
                        </div>
                    </div>
                </div>

                {/* Workflow Actions - Sticky */}
                <div className="px-4 sm:px-6 pb-3 sm:pb-4 shrink-0">
                    <div className="flex flex-wrap gap-2">
                        {task.status === 'todo' && (
                            <button
                                onClick={() => { updateTaskStatus(task.id, 'in-progress'); onClose(); }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors shadow-sm"
                            >
                                <Play size={16} /> Comenzar Tarea
                            </button>
                        )}
                        {task.status === 'in-progress' && (
                            <button
                                onClick={() => { updateTaskStatus(task.id, 'review'); onClose(); }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-purple-500 text-white rounded-xl text-sm font-bold hover:bg-purple-600 transition-colors shadow-sm"
                            >
                                <Eye size={16} /> Solicitar Revisión
                            </button>
                        )}
                        {task.status === 'review' && (
                            <>
                                <button
                                    onClick={() => { updateTaskStatus(task.id, 'in-progress'); onClose(); }}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 text-white rounded-xl text-sm font-bold hover:bg-yellow-600 transition-colors shadow-sm"
                                >
                                    <RotateCcw size={16} /> En Progreso
                                </button>
                                <button
                                    onClick={() => { updateTaskStatus(task.id, 'done'); onClose(); }}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-sm"
                                >
                                    <ThumbsUp size={16} /> Aprobar
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Footer - Sticky */}
                <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 shrink-0">
                    <button className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors" onClick={onClose}>Cerrar</button>
                </div>
            </div>
        </div>
    )
}

const DayOverviewModal: React.FC<{ date: string; tasks: Task[]; onClose: () => void; onTaskClick: (t: Task) => void }> = ({ date, tasks, onClose, onTaskClick }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Tareas del día {date}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="p-2 max-h-[60vh] overflow-y-auto">
                    {tasks.length > 0 ? (
                        tasks.map(task => (
                            <div
                                key={task.id}
                                onClick={() => { onClose(); onTaskClick(task); }}
                                className="p-3 hover:bg-gray-50 rounded-xl cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${PRIORITY_COLORS[task.priority]}`}>{task.category}</span>
                                    <span className={`text-[10px] font-bold ${COLUMNS.find(c => c.id === task.status)?.color.replace('bg-', 'text-')}`}>
                                        {COLUMNS.find(c => c.id === task.status)?.label}
                                    </span>
                                </div>
                                <h4 className="font-bold text-gray-800 text-sm">{task.title}</h4>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-400 text-sm">No hay tareas para este día</div>
                    )}
                </div>
            </div>
        </div>
    )
}

// --- Main Component ---

export const KanbanBoard: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [view, setView] = useState<'board' | 'list' | 'calendar'>('board');
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [selectedDay, setSelectedDay] = useState<{ date: string, tasks: Task[] } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const CLIENT_ID = localStorage.getItem('clientId');

    const fetchData = React.useCallback(async () => {
        if (!CLIENT_ID) return;
        setIsLoading(true);
        try {
            // 1. Fetch Standard Tasks and Strategy in parallel
            const [tasksRes, strategyRes] = await Promise.all([
                api.getTasks(CLIENT_ID),
                api.getStrategy(CLIENT_ID)
            ]);

            // 2. Process Standard Tasks
            const res: any = tasksRes;
            const week1 = res.week_1 || [];
            const week2 = res.week_2 || [];
            const week3 = res.week_3 || [];
            const week4 = res.week_4 || [];

            const allRaw = [...week1, ...week2, ...week3, ...week4];

            const standardTasks: Task[] = allRaw.map((t: any) => ({
                id: t.id,
                title: t.title,
                description: t.description || '',
                category: t.area_estrategica || 'General',
                date: t.execution_date ? t.execution_date.slice(0, 10) : (t.due_date ? t.due_date.slice(0, 10) : (t.created_at ? t.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10))),
                status: mapStatusFromBackend(t.status),
                priority: mapPriorityFromBackend(t.priority),
                members: [],
                // Phase 1 Enriched Fields
                selected_hook: t.selected_hook,
                narrative_structure: t.narrative_structure,
                key_elements: t.key_elements,
                dos: t.dos,
                donts: t.donts,
                strategic_purpose: t.strategic_purpose,
                copy_suggestion: t.copy_suggestion,
                format: t.format
            }));

            // 3. Process Strategy Posts
            let strategyTasks: Task[] = [];
            if (Array.isArray(strategyRes)) {
                // Filter for 'post' type nodes
                const postNodes = strategyRes.filter((node: any) => node.type === 'post');

                strategyTasks = postNodes.map((node: any) => {
                    return {
                        id: node.id,
                        title: node.label,
                        description: node.description || 'Contenido estrátegico generado desde el mapa.',
                        category: 'Contenido',
                        date: new Date().toISOString().slice(0, 10), // Default to today
                        status: 'todo', // Default to To-Do
                        priority: 'medium',
                        members: []
                    };
                });
            }

            // 4. Merge
            const taskMap = new Map<string, Task>();
            standardTasks.forEach(t => taskMap.set(t.id, t));
            strategyTasks.forEach(t => taskMap.set(t.id, t));

            setTasks(Array.from(taskMap.values()));

        } catch (e) {
            console.error("Failed to fetch data", e);
        } finally {
            setIsLoading(false);
        }
    }, [CLIENT_ID]);

    // Fetch Tasks & Strategy Posts
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // DnD State
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [activeDropZone, setActiveDropZone] = useState<string | null>(null); // Generalized to string to support Status or Date ID

    const handleDragStart = React.useCallback((e: React.DragEvent, id: string) => {
        setDraggedTaskId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
    }, []);

    const handleDragEnd = React.useCallback(() => {
        setDraggedTaskId(null);
        setActiveDropZone(null);
    }, []);

    // Debounced version of setActiveDropZone to reduce re-renders during drag
    const debouncedSetActiveDropZone = useMemo(
        () => debounce((zoneId: string) => {
            setActiveDropZone(zoneId);
        }, 16), // ~1 frame at 60fps
        []
    );

    const handleDragOver = React.useCallback((e: React.DragEvent, zoneId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Use debounced version to reduce state updates
        if (activeDropZone !== zoneId) {
            debouncedSetActiveDropZone(zoneId);
        }
    }, [activeDropZone, debouncedSetActiveDropZone]);

    const updateStatusAPI = React.useCallback(async (id: string, newStatus: Status) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

        // API Call
        try {
            await api.updateTaskStatus(id, mapStatusToBackend(newStatus) as any);
        } catch (e) {
            console.error("Failed to update status", e);
            // Revert? For now, we assume success or reload page.
        }
    }, []);

    // Handle dropping in Board/List View (updates Status)
    const handleDropToStatus = React.useCallback((e: React.DragEvent, status: Status) => {
        e.preventDefault();
        e.stopPropagation();

        const id = e.dataTransfer.getData('text/plain') || draggedTaskId;

        if (!id) {
            setActiveDropZone(null);
            return;
        }

        updateStatusAPI(id, status);

        setDraggedTaskId(null);
        setActiveDropZone(null);
    }, [draggedTaskId, updateStatusAPI]);

    // Handle dropping in Calendar View (updates Date)
    const handleDropToDate = React.useCallback((e: React.DragEvent, dateString: string) => {
        e.preventDefault();
        e.stopPropagation();

        const id = e.dataTransfer.getData('text/plain') || draggedTaskId;

        if (!id) {
            setActiveDropZone(null);
            return;
        }

        setTasks(prevTasks => prevTasks.map(t => {
            if (t.id === id) {
                return { ...t, date: dateString };
            }
            return t;
        }));

        setDraggedTaskId(null);
        setActiveDropZone(null);
    }, [draggedTaskId]);

    // --- Views ---

    const BoardView = () => (
        <div className="relative">
            {/* Scroll Indicator for Mobile */}
            <div className="lg:hidden absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-brand-bg to-transparent pointer-events-none z-10" />

            <div className="flex gap-4 h-full overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                {COLUMNS.map((col) => (
                    <div
                        key={col.id}
                        className="flex-shrink-0 flex flex-col h-full snap-start w-[280px] sm:w-[300px] md:w-[320px] lg:w-1/4 lg:flex-1"
                        onDragOver={(e) => handleDragOver(e, col.id)}
                        onDrop={(e) => handleDropToStatus(e, col.id)}
                    >
                        <div className="flex items-center justify-between mb-4 px-1">
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${col.color}`} />
                                <span className="font-bold text-gray-700 text-sm">{col.label}</span>
                                <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                                    {tasks.filter(t => t.status === col.id).length}
                                </span>
                            </div>
                        </div>
                        <div
                            className={`flex-1 bg-gray-50/50 rounded-2xl p-2 space-y-3 min-h-[150px] border-2 transition-all duration-200
                ${activeDropZone === col.id ? 'border-primary-300 bg-primary-50/20' : 'border-transparent'}
            `}
                        >
                            {tasks.filter(t => t.status === col.id).map(task => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onClick={setSelectedTask}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd}
                                    isDragging={draggedTaskId === task.id}
                                />
                            ))}
                            {tasks.filter(t => t.status === col.id).length === 0 && (
                                <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400 font-medium">
                                    Arrastra aquí
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const ListView = () => (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col h-full">
            {/* 
        Modified List View to support DnD Status Change.
        We group items by status to allow dropping into a "status zone".
      */}
            <div className="grid grid-cols-1 divide-y divide-gray-100 overflow-y-auto">
                {COLUMNS.map(col => {
                    const colTasks = tasks.filter(t => t.status === col.id);

                    return (
                        <div
                            key={col.id}
                            onDragOver={(e) => handleDragOver(e, col.id)}
                            onDrop={(e) => handleDropToStatus(e, col.id)}
                            className={`transition-colors duration-200 ${activeDropZone === col.id ? 'bg-primary-50/30' : ''}`}
                        >
                            {/* Group Header */}
                            <div className="bg-gray-50 px-6 py-2 flex items-center justify-between pointer-events-none">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${col.color}`} />
                                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wide">{col.label}</span>
                                </div>
                                <span className="text-[10px] bg-white px-2 py-0.5 rounded-full text-gray-400 font-bold border border-gray-200">
                                    {colTasks.length}
                                </span>
                            </div>

                            {/* Rows */}
                            {colTasks.length > 0 ? (
                                <table className="w-full text-left text-sm">
                                    <tbody className="divide-y divide-gray-50">
                                        {colTasks.map(task => (
                                            <tr
                                                key={task.id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, task.id)}
                                                onDragEnd={handleDragEnd}
                                                onClick={() => setSelectedTask(task)}
                                                className={`hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing group
                                        ${draggedTaskId === task.id ? 'opacity-40 grayscale bg-gray-50' : ''}
                                    `}
                                            >
                                                <td className="px-6 py-3 w-[40%]">
                                                    <div className="flex items-center gap-3 pointer-events-none">
                                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 text-gray-500">
                                                            <FileText size={16} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-800">{task.title}</div>
                                                            <div className="text-xs text-gray-400">{task.category}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-3 w-[20%] pointer-events-none">
                                                    <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded border ${PRIORITY_COLORS[task.priority]}`}>
                                                        {task.priority}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-3 w-[20%] text-right text-gray-500 font-mono text-xs pointer-events-none">
                                                    {task.date}
                                                </td>
                                                <td className="px-6 py-3 w-[20%] flex justify-end pointer-events-none">
                                                    <MemberStack members={task.members} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="py-6 text-center text-xs text-gray-400 italic pointer-events-none">
                                    No hay tareas en {col.label}. Arrastra aquí para mover.
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    );

    const CalendarView = () => {
        const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
        const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

        const getDaysInMonth = (month: number, year: number) => {
            return new Date(year, month + 1, 0).getDate();
        };

        const getFirstDayOfMonth = (month: number, year: number) => {
            // Adjust to Monday start (0 = Monday, 6 = Sunday)
            const day = new Date(year, month, 1).getDay();
            return day === 0 ? 6 : day - 1;
        };

        const daysInMonth = getDaysInMonth(currentMonth, currentYear);
        const firstDay = getFirstDayOfMonth(currentMonth, currentYear);

        // Generate calendar grid (6 weeks x 7 days) to ensure all days fit
        const days = Array.from({ length: 42 }, (_, i) => {
            const dayOffset = i - firstDay + 1;
            const date = new Date(currentYear, currentMonth, dayOffset);
            return {
                day: date.getDate(),
                month: date.getMonth(),
                year: date.getFullYear(),
                isCurrentMonth: date.getMonth() === currentMonth,
                dateString: date.toISOString().slice(0, 10)
            };
        });

        const monthName = new Date(currentYear, currentMonth).toLocaleString('es-ES', { month: 'long', year: 'numeric' });

        return (
            <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4 px-2">
                    <h3 className="text-lg font-bold text-gray-800 capitalize">{monthName}</h3>
                    <div className="flex gap-1">
                        <button
                            onClick={() => {
                                if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(currentYear - 1); }
                                else { setCurrentMonth(currentMonth - 1); }
                            }}
                            className="p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={() => {
                                if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(currentYear + 1); }
                                else { setCurrentMonth(currentMonth + 1); }
                            }}
                            className="p-1 hover:bg-gray-100 rounded-lg"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-7 mb-2 text-center">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                        <div key={d} className="text-xs font-bold text-gray-400 uppercase py-2">{d}</div>
                    ))}
                </div>

                <div className="flex-1 grid grid-cols-7 grid-rows-6 gap-2">
                    {days.map((d, idx) => {
                        // Find tasks for this date
                        const dayTasks = tasks.filter((t) => t.date === d.dateString);
                        const visibleTasks = dayTasks.slice(0, 2);
                        const overflowCount = dayTasks.length - 2;

                        return (
                            <div
                                key={idx}
                                onDragOver={(e) => d.isCurrentMonth && handleDragOver(e, d.dateString)}
                                onDrop={(e) => d.isCurrentMonth && handleDropToDate(e, d.dateString)}
                                onClick={() => { if (dayTasks.length > 0) setSelectedDay({ date: d.dateString, tasks: dayTasks }) }}
                                className={`rounded-xl p-2 border transition-all min-h-[80px] flex flex-col gap-1 cursor-pointer
                                ${!d.isCurrentMonth ? 'opacity-30 border-transparent bg-gray-50/50' : 'bg-white border-gray-100 hover:border-primary-200'}
                                ${activeDropZone === d.dateString ? 'bg-primary-50 ring-2 ring-primary-200' : ''}
                            `}
                            >
                                <span className={`text-xs font-bold mb-1 pointer-events-none ${d.day === new Date().getDate() && d.month === new Date().getMonth() && d.year === new Date().getFullYear() ? 'text-primary-500 bg-primary-50 w-6 h-6 flex items-center justify-center rounded-full' : 'text-gray-400'}`}>
                                    {d.day}
                                </span>
                                {visibleTasks.map(t => (
                                    <div
                                        key={t.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, t.id)}
                                        onDragEnd={handleDragEnd}
                                        onClick={(e) => { e.stopPropagation(); setSelectedTask(t); }}
                                        className={`text-[9px] px-1.5 py-1 rounded truncate font-medium border-l-2 shadow-sm cursor-grab active:cursor-grabbing hover:opacity-80 select-none
                                      ${COLUMNS.find(c => c.id === t.status)?.badge} border-${COLUMNS.find(c => c.id === t.status)?.color.replace('bg-', '')}
                                      ${draggedTaskId === t.id ? 'opacity-40' : ''}
                                    `}
                                    >
                                        <span className="pointer-events-none">{t.title}</span>
                                    </div>
                                ))}
                                {overflowCount > 0 && (
                                    <div className="mt-auto pt-1 pointer-events-none">
                                        <span className="text-[10px] text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-full w-full block text-center">
                                            +{overflowCount} más
                                        </span>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="col-span-12 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 min-h-[600px] flex flex-col relative">

            {/* Modals */}
            {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} updateTaskStatus={(id, status) => setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t))} />}
            {selectedDay && <DayOverviewModal date={selectedDay.date} tasks={selectedDay.tasks} onClose={() => setSelectedDay(null)} onTaskClick={setSelectedTask} />}

            {/* Header Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Gestión de Tareas</h2>
                    <p className="text-sm text-gray-400">Visualiza y gestiona el flujo de trabajo</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* View Switcher */}
                    <div className="flex bg-gray-50 p-1 rounded-xl gap-2">
                        {/* Refresh Button */}
                        <button
                            onClick={fetchData}
                            className="p-2 text-gray-400 hover:text-primary-500 hover:bg-white rounded-lg transition-all"
                            title="Recargar tareas y estrategias"
                        >
                            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
                        </button>
                        <div className="w-px h-6 bg-gray-200 my-auto"></div>

                        <button
                            onClick={() => setView('board')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'board' ? 'bg-white text-primary-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <Layout size={16} /> Tablero
                        </button>
                        <button
                            onClick={() => setView('list')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'list' ? 'bg-white text-primary-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <List size={16} /> Lista
                        </button>
                        <button
                            onClick={() => setView('calendar')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${view === 'calendar' ? 'bg-white text-primary-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            <CalendarIcon size={16} /> Calendario
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-h-0">
                {view === 'board' && <BoardView />}
                {view === 'list' && <ListView />}
                {view === 'calendar' && <CalendarView />}
            </div>
        </div>
    );
};