import React, { useState } from 'react';
import {
  Layout,
  List,
  Calendar as CalendarIcon,
  MoreHorizontal,
  Clock,
  Target,
  X,
  FileText,
  Plus,
  Loader2,
  AlertCircle,
  Inbox,
  Play,
  Eye,
  RotateCcw,
  ThumbsUp
} from 'lucide-react';
import { useTasksContext } from '../hooks/useTasks';
import { Task, TaskStatus } from '../services/api';

// =============================================================================
// TYPES & CONSTANTS
// =============================================================================

type ViewMode = 'board' | 'list' | 'calendar';

// Map API status to UI columns
const STATUS_COLUMNS: { id: TaskStatus; label: string; color: string; badge: string }[] = [
  { id: 'PENDIENTE', label: 'Por Hacer', color: 'bg-gray-400', badge: 'bg-gray-100 text-gray-600' },
  { id: 'EN_CURSO', label: 'En Progreso', color: 'bg-primary-500', badge: 'bg-primary-50 text-primary-600' },
  { id: 'REVISADO', label: 'En Revisión', color: 'bg-purple-500', badge: 'bg-purple-50 text-purple-600' },
  { id: 'HECHO', label: 'Completado', color: 'bg-chart-green', badge: 'bg-green-50 text-green-700' },
];

const URGENCY_COLORS: Record<string, string> = {
  'alta': 'text-chart-red bg-chart-red/10 border-chart-red/20',
  'media': 'text-chart-yellow bg-chart-yellow/10 border-chart-yellow/20',
  'baja': 'text-chart-blue bg-chart-blue/10 border-chart-blue/20',
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

const ImpactBadge: React.FC<{ score: number | null }> = ({ score }) => {
  if (score === null) return null;
  const color = score >= 7 ? 'text-green-600 bg-green-50' :
    score >= 4 ? 'text-yellow-600 bg-yellow-50' :
      'text-red-600 bg-red-50';
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${color}`}>
      Impacto: {score}/10
    </span>
  );
};

const TaskCard: React.FC<{
  task: Task;
  onClick: (t: Task) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: () => void;
  isDragging: boolean;
}> = ({ task, onClick, onDragStart, onDragEnd, isDragging }) => {
  const urgencyColor = URGENCY_COLORS[task.urgencia?.toLowerCase() || ''] || URGENCY_COLORS['media'];

  return (
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
        <div className="flex items-center gap-2">
          {task.area_estrategica && (
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${urgencyColor}`}>
              {task.area_estrategica}
            </span>
          )}
          {task.week && (
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">
              Sem {task.week}
            </span>
          )}
        </div>
        <button className="text-gray-300 pointer-events-auto hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal size={16} />
        </button>
      </div>
      <h4 className="text-sm font-bold text-gray-800 mb-1 leading-tight pointer-events-none">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-gray-400 line-clamp-2 mb-3 pointer-events-none">{task.description}</p>
      )}
      <div className="flex justify-between items-center border-t border-gray-50 pt-3 pointer-events-none">
        <div className="flex items-center gap-1.5 text-gray-400">
          <Clock size={12} />
          <span className="text-[10px] font-medium">
            {new Date(task.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ImpactBadge score={task.score_impacto} />
          {task.prioridad && (
            <span className="text-[10px] font-bold text-gray-400">#{task.prioridad}</span>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// MODALS
// =============================================================================

const TaskDetailModal: React.FC<{ task: Task; onClose: () => void; onStatusChange: (id: string, newStatus: TaskStatus) => void }> = ({ task, onClose, onStatusChange }) => {
  const statusCol = STATUS_COLUMNS.find(c => c.id === task.status);
  const urgencyColor = URGENCY_COLORS[task.urgencia?.toLowerCase() || ''] || URGENCY_COLORS['media'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {task.area_estrategica && (
                <span className={`px - 2 py - 0.5 rounded text - [10px] font - bold uppercase tracking - wide border ${urgencyColor} `}>
                  {task.area_estrategica}
                </span>
              )}
              {statusCol && (
                <span className={`px - 2 py - 0.5 rounded text - [10px] font - bold uppercase tracking - wide ${statusCol.badge} `}>
                  {statusCol.label}
                </span>
              )}
              {task.week && (
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-600">
                  Semana {task.week}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-gray-900">{task.title}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {task.description && (
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <FileText size={16} /> Descripción
              </div>
              <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
                {task.description}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Target size={16} /> Métricas
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                {task.score_impacto !== null && (
                  <div className="flex justify-between">
                    <span>Impacto:</span>
                    <span className="font-bold">{task.score_impacto}/10</span>
                  </div>
                )}
                {task.score_esfuerzo !== null && (
                  <div className="flex justify-between">
                    <span>Esfuerzo:</span>
                    <span className="font-bold">{task.score_esfuerzo}/10</span>
                  </div>
                )}
                {task.urgencia && (
                  <div className="flex justify-between">
                    <span>Urgencia:</span>
                    <span className="font-bold capitalize">{task.urgencia}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Clock size={16} /> Fechas
              </div>
              <div className="text-sm text-gray-600">
                <div className="mb-1">
                  <span className="text-gray-400">Creada:</span>{' '}
                  {new Date(task.created_at).toLocaleDateString(undefined, {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
                {task.completed_at && (
                  <div>
                    <span className="text-gray-400">Completada:</span>{' '}
                    {new Date(task.completed_at).toLocaleDateString(undefined, {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {task.notes && task.notes.length > 0 && (
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <FileText size={16} /> Notas ({task.notes.length})
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {task.notes.map(note => (
                  <div key={note.id} className="text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                    <p>{note.content}</p>
                    <span className="text-gray-400 text-[10px]">
                      {new Date(note.created_at).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 flex-wrap">
          <button
            className="px-4 py-2 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-200 transition-colors"
            onClick={onClose}
          >
            Cerrar
          </button>

          {/* Workflow Action Buttons */}

          {/* PENDIENTE → EN_CURSO */}
          {task.status === 'PENDIENTE' && (
            <button
              onClick={() => { onStatusChange(task.id, 'EN_CURSO'); onClose(); }}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 transition-all flex items-center gap-2 shadow-lg shadow-primary-200 transform active:scale-95"
            >
              <Play size={16} />
              Comenzar Tarea
            </button>
          )}

          {/* EN_CURSO → REVISADO */}
          {task.status === 'EN_CURSO' && (
            <button
              onClick={() => { onStatusChange(task.id, 'REVISADO'); onClose(); }}
              className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-purple-500 hover:bg-purple-600 transition-all flex items-center gap-2 shadow-lg shadow-purple-200 transform active:scale-95"
            >
              <Eye size={16} />
              Solicitar Revisión
            </button>
          )}

          {/* REVISADO → (EN_CURSO o HECHO) */}
          {task.status === 'REVISADO' && (
            <>
              <button
                onClick={() => { onStatusChange(task.id, 'EN_CURSO'); onClose(); }}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-orange-400 hover:bg-orange-500 transition-all flex items-center gap-2 shadow-lg shadow-orange-200 transform active:scale-95"
              >
                <RotateCcw size={16} />
                En Progreso
              </button>
              <button
                onClick={() => { onStatusChange(task.id, 'HECHO'); onClose(); }}
                className="px-5 py-2 rounded-xl text-sm font-bold text-white bg-green-500 hover:bg-green-600 transition-all flex items-center gap-2 shadow-lg shadow-green-200 transform active:scale-95"
              >
                <ThumbsUp size={16} />
                Aprobar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// EMPTY STATE
// =============================================================================

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 px-8">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
      <Inbox size={40} className="text-gray-400" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">No hay tareas aún</h3>
    <p className="text-gray-500 text-center max-w-md mb-6">
      Las tareas se generarán automáticamente después de ejecutar el análisis Q1-Q10,
      o puedes crear tareas manualmente.
    </p>
    <div className="flex gap-3">
      <button className="px-4 py-2 bg-primary-500 text-white rounded-xl text-sm font-bold hover:bg-primary-600 transition-colors flex items-center gap-2">
        <Plus size={16} />
        Crear Tarea
      </button>
    </div>
  </div>
)

  ;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const KanbanBoard: React.FC = () => {
  const { tasks, isLoading, error, updateTaskStatus } = useTasksContext();
  const [view, setView] = useState<ViewMode>('board');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // DnD State
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTaskId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setActiveDropZone(null);
  };

  const handleDragOver = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropZone !== zoneId) {
      setActiveDropZone(zoneId);
    }
  };

  const handleDropToStatus = async (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.stopPropagation();

    const id = e.dataTransfer.getData('text/plain') || draggedTaskId;

    if (!id) {
      setActiveDropZone(null);
      return;
    }

    try {
      await updateTaskStatus(id, status);
    } catch (err) {
      console.error('Failed to update task status:', err);
    }

    setDraggedTaskId(null);
    setActiveDropZone(null);
  };

  // =============================================================================
  // VIEWS
  // =============================================================================

  const BoardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-full overflow-x-auto pb-4 items-start">
      {STATUS_COLUMNS.map((col) => {
        const columnTasks = tasks.filter(t => t.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col h-full min-w-[260px]"
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDrop={(e) => handleDropToStatus(e, col.id)}
          >
            <div className="flex items-center justify-between mb-4 px-1 pointer-events-none">
              <div className="flex items-center gap-2">
                <div className={`w - 2 h - 2 rounded - full ${col.color} `} />
                <span className="font-bold text-gray-700 text-sm">{col.label}</span>
                <span className="bg-gray-100 text-gray-500 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                  {columnTasks.length}
                </span>
              </div>
            </div>
            <div
              className={`flex - 1 bg - gray - 50 / 50 rounded - 2xl p - 2 space - y - 3 min - h - [150px] border - 2 transition - all duration - 200
                  ${activeDropZone === col.id ? 'border-primary-300 bg-primary-50/20' : 'border-transparent'}
`}
            >
              {columnTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={setSelectedTask}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedTaskId === task.id}
                />
              ))}
              {columnTasks.length === 0 && (
                <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400 font-medium pointer-events-none">
                  Arrastra aquí
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  const ListView = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="grid grid-cols-1 divide-y divide-gray-100 overflow-y-auto">
        {STATUS_COLUMNS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.id);

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDropToStatus(e, col.id)}
              className={`transition - colors duration - 200 ${activeDropZone === col.id ? 'bg-primary-50/30' : ''} `}
            >
              {/* Group Header */}
              <div className="bg-gray-50 px-6 py-2 flex items-center justify-between pointer-events-none">
                <div className="flex items-center gap-2">
                  <div className={`w - 2 h - 2 rounded - full ${col.color} `} />
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
                    {colTasks.map(task => {
                      const urgencyColor = URGENCY_COLORS[task.urgencia?.toLowerCase() || ''] || URGENCY_COLORS['media'];
                      return (
                        <tr
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedTask(task)}
                          className={`hover: bg - gray - 50 transition - colors cursor - grab active: cursor - grabbing group
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
                                <div className="text-xs text-gray-400">{task.area_estrategica || 'General'}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-3 w-[20%] pointer-events-none">
                            <span className={`text - [10px] uppercase font - bold px - 2 py - 1 rounded border ${urgencyColor} `}>
                              {task.urgencia || 'media'}
                            </span>
                          </td>
                          <td className="px-6 py-3 w-[20%] text-gray-500 font-mono text-xs pointer-events-none">
                            Sem {task.week}
                          </td>
                          <td className="px-6 py-3 w-[20%] text-right pointer-events-none">
                            <ImpactBadge score={task.score_impacto} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="py-6 text-center text-xs text-gray-400 italic pointer-events-none">
                  No hay tareas en {col.label}. Arrastra aquí para mover.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  const CalendarView = () => {
    // Group tasks by week
    const tasksByWeek = [1, 2, 3, 4].map(week => ({
      week,
      tasks: tasks.filter(t => t.week === week)
    }));

    return (
      <div className="h-full flex flex-col">
        <div className="grid grid-cols-4 gap-4 mb-4">
          {tasksByWeek.map(({ week, tasks: weekTasks }) => (
            <div key={week} className="text-center">
              <div className="text-xs font-bold text-gray-400 uppercase py-2">
                Semana {week}
              </div>
              <div className="text-2xl font-bold text-gray-800">{weekTasks.length}</div>
              <div className="text-xs text-gray-400">tareas</div>
            </div>
          ))}
        </div>
        <div className="flex-1 grid grid-cols-4 gap-4">
          {tasksByWeek.map(({ week, tasks: weekTasks }) => (
            <div
              key={week}
              className="bg-gray-50 rounded-2xl p-4 space-y-3 overflow-y-auto"
            >
              {weekTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={setSelectedTask}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedTaskId === task.id}
                />
              ))}
              {weekTasks.length === 0 && (
                <div className="h-24 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-xs text-gray-400 font-medium">
                  Sin tareas
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  if (isLoading) {
    return (
      <div className="col-span-12 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 min-h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={40} className="animate-spin text-primary-500" />
          <p className="text-gray-500">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="col-span-12 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 min-h-[600px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle size={32} className="text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Error al cargar tareas</h3>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-12 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 min-h-[600px] flex flex-col relative">

      {/* Modals */}
      {selectedTask && <TaskDetailModal task={selectedTask} onClose={() => setSelectedTask(null)} onStatusChange={updateTaskStatus} />}

      {/* Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestión de Tareas</h2>
          <p className="text-sm text-gray-400">
            {tasks.length} tareas en total • {tasks.filter(t => t.status === 'HECHO').length} completadas
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* View Switcher */}
          <div className="flex bg-gray-50 p-1 rounded-xl">
            <button
              onClick={() => setView('board')}
              className={`flex items - center gap - 2 px - 4 py - 2 rounded - lg text - xs font - bold transition - all ${view === 'board' ? 'bg-white text-primary-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'} `}
            >
              <Layout size={16} /> Tablero
            </button>
            <button
              onClick={() => setView('list')}
              className={`flex items - center gap - 2 px - 4 py - 2 rounded - lg text - xs font - bold transition - all ${view === 'list' ? 'bg-white text-primary-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'} `}
            >
              <List size={16} /> Lista
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex items - center gap - 2 px - 4 py - 2 rounded - lg text - xs font - bold transition - all ${view === 'calendar' ? 'bg-white text-primary-500 shadow-sm' : 'text-gray-400 hover:text-gray-600'} `}
            >
              <CalendarIcon size={16} /> Semanas
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        {tasks.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {view === 'board' && <BoardView />}
            {view === 'list' && <ListView />}
            {view === 'calendar' && <CalendarView />}
          </>
        )}
      </div>
    </div>
  );
};