import React, { useState, useEffect } from 'react';
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
    ThumbsUp
} from 'lucide-react';
import * as api from '../services/api';

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
}> = ({ task, onClick, onDragStart, onDragEnd, isDragging }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, task.id)}
        onDragEnd={onDragEnd}
        onClick={() => onClick(task)}
        className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md hover:border-primary-200 transition-all cursor-grab active:cursor-grabbing group select-none
        ${isDragging ? 'opacity-40 grayscale shadow-none border-dashed border-gray-300' : 'opacity-100'}
    `}
    >
        <div className="flex justify-between items-start mb-2 pointer-events-none">
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${PRIORITY_COLORS[task.priority]}`}>
                {task.category}
            </span>
            <button className="text-gray-300 pointer-events-auto hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal size={16} />
            </button>
        </div>
        <h4 className="text-sm font-bold text-gray-800 mb-1 leading-tight pointer-events-none">{task.title}</h4>
        <p className="text-xs text-gray-400 line-clamp-2 mb-3 pointer-events-none">{task.description}</p>
        <div className="flex justify-between items-center border-t border-gray-50 pt-3 pointer-events-none">
            <div className="flex items-center gap-1.5 text-gray-400">
                <Clock size={12} />
                <span className="text-[10px] font-medium">{task.date ? new Date(task.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }) : 'No date'}</span>
            </div>
            <MemberStack members={task.members} />
        </div>
    </div>
);

// --- Modals ---

const TaskDetailModal: React.FC<{ task: Task; onClose: () => void; updateTaskStatus: (id: string, status: Status) => void }> = ({ task, onClose, updateTaskStatus }) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${PRIORITY_COLORS[task.priority]}`}>
                                {task.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${COLUMNS.find(c => c.id === task.status)?.badge}`}>
                                {COLUMNS.find(c => c.id === task.status)?.label}
                            </span>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} className="text-gray-500" /></button>
                </div>

                <div className="p-6 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                            <FileText size={16} /> Descripción
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                            {task.description}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                <Clock size={16} /> Fecha Límite
                            </div>
                            <div className="text-sm text-gray-600">{task.date ? new Date(task.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : 'Sin fecha'}</div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                                <User size={16} /> Asignado a
                            </div>
                            <MemberStack members={task.members} />
                        </div>
                    </div>
                </div>

                {/* Workflow Actions */}
                <div className="px-6 pb-4">
                    <div className="flex flex-wrap gap-2">
                        {task.status === 'todo' && (
                            <button
                                onClick={() => { updateTaskStatus(task.id, 'in-progress'); onClose(); }}
                                className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors shadow-sm"
                            >
                                <Play size={16} /> Comenzar Tarea
                            </button>
                        )}
                        {task.status === 'in-progress' && (
                            <button
                                onClick={() => { updateTaskStatus(task.id, 'review'); onClose(); }}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl text-sm font-bold hover:bg-purple-600 transition-colors shadow-sm"
                            >
                                <Eye size={16} /> Solicitar Revisión
                            </button>
                        )}
                        {task.status === 'review' && (
                            <>
                                <button
                                    onClick={() => { updateTaskStatus(task.id, 'in-progress'); onClose(); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-white rounded-xl text-sm font-bold hover:bg-yellow-600 transition-colors shadow-sm"
                                >
                                    <RotateCcw size={16} /> En Progreso
                                </button>
                                <button
                                    onClick={() => { updateTaskStatus(task.id, 'done'); onClose(); }}
                                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors shadow-sm"
                                >
                                    <ThumbsUp size={16} /> Aprobar
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
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

    // Fetch Tasks
    useEffect(() => {
        const fetchTasks = async () => {
            if (!CLIENT_ID) return;
            setIsLoading(true);
            try {
                // api.getTasks returns TasksByWeekResponse (nested weeks)
                // We need to cast or inspect response. Since we know structure from backend analysis...
                // But TypeScript might complain if api definitions are different.
                // Assuming api.getTasks returns 'any' or 'TasksByWeekResponse'.
                const res: any = await api.getTasks(CLIENT_ID);

                // Flatten weeks
                const week1 = res.week_1 || [];
                const week2 = res.week_2 || [];
                const week3 = res.week_3 || [];
                const week4 = res.week_4 || [];

                const allRaw = [...week1, ...week2, ...week3, ...week4];

                const mapped: Task[] = allRaw.map((t: any) => ({
                    id: t.id,
                    title: t.title,
                    description: t.description || '',
                    category: t.area_estrategica || 'General',
                    date: t.created_at ? t.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
                    status: mapStatusFromBackend(t.status),
                    priority: mapPriorityFromBackend(t.priority),
                    members: [] // Mock members
                }));

                setTasks(mapped);

            } catch (e) {
                console.error("Failed to fetch tasks", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTasks();
    }, [CLIENT_ID]);

    // DnD State
    const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
    const [activeDropZone, setActiveDropZone] = useState<string | null>(null); // Generalized to string to support Status or Date ID

    const handleDragStart = (e: React.DragEvent, id: string) => {
        setDraggedTaskId(id);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', id);
    }

    const handleDragEnd = () => {
        setDraggedTaskId(null);
        setActiveDropZone(null);
    }

    const handleDragOver = (e: React.DragEvent, zoneId: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        if (activeDropZone !== zoneId) {
            setActiveDropZone(zoneId);
        }
    }

    const updateStatusAPI = async (id: string, newStatus: Status) => {
        // Optimistic update
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));

        // API Call
        try {
            await api.updateTaskStatus(id, mapStatusToBackend(newStatus) as any);
        } catch (e) {
            console.error("Failed to update status", e);
            // Revert? For now, we assume success or reload page.
        }
    };

    // Handle dropping in Board/List View (updates Status)
    const handleDropToStatus = (e: React.DragEvent, status: Status) => {
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
    }

    // Handle dropping in Calendar View (updates Date)
    const handleDropToDate = (e: React.DragEvent, dateString: string) => {
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
    }

    // --- Views ---

    const BoardView = () => (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full overflow-x-auto pb-4 items-start">
            {COLUMNS.map((col) => (
                <div
                    key={col.id}
                    className="flex flex-col h-full min-w-[260px]"
                    onDragOver={(e) => handleDragOver(e, col.id)}
                    onDrop={(e) => handleDropToStatus(e, col.id)}
                >
                    <div className="flex items-center justify-between mb-4 px-1 pointer-events-none">
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
                            <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400 font-medium pointer-events-none">
                                Arrastra aquí
                            </div>
                        )}
                    </div>
                </div>
            ))}
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
        // Mock Visual Calendar logic
        const days = Array.from({ length: 35 }, (_, i) => i + 1); // 5 weeks

        return (
            <div className="h-full flex flex-col">
                <div className="grid grid-cols-7 mb-2 text-center">
                    {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(d => (
                        <div key={d} className="text-xs font-bold text-gray-400 uppercase py-2">{d}</div>
                    ))}
                </div>
                <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-2">
                    {days.map((day, idx) => {
                        const displayDay = day > 31 ? day - 31 : day;
                        const isNextMonth = day > 31;

                        // Construct a comparable date string for the mock calendar (Oct 2023)
                        const dateString = `2023-10-${displayDay.toString().padStart(2, '0')}`;

                        // Find tasks for this date
                        const dayTasks = tasks.filter((t) => t.date === dateString && !isNextMonth);

                        const visibleTasks = dayTasks.slice(0, 2);
                        const overflowCount = dayTasks.length - 2;

                        return (
                            <div
                                key={idx}
                                onDragOver={(e) => !isNextMonth && handleDragOver(e, dateString)}
                                onDrop={(e) => !isNextMonth && handleDropToDate(e, dateString)}
                                onClick={() => { if (dayTasks.length > 0) setSelectedDay({ date: `Oct ${displayDay}`, tasks: dayTasks }) }}
                                className={`rounded-xl p-2 border transition-all min-h-[100px] flex flex-col gap-1 cursor-pointer
                                ${isNextMonth ? 'opacity-30 border-transparent bg-gray-50/50' : 'bg-white border-gray-100 hover:border-primary-200'}
                                ${activeDropZone === dateString ? 'bg-primary-50 ring-2 ring-primary-200' : ''}
                            `}
                            >
                                <span className={`text-xs font-bold mb-1 pointer-events-none ${displayDay === 15 ? 'text-primary-500' : 'text-gray-400'}`}>{displayDay}</span>
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
                    <p className="text-sm text-gray-400">Sprint 42 • Octubre 2023</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
                    {/* View Switcher */}
                    <div className="flex bg-gray-50 p-1 rounded-xl">
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