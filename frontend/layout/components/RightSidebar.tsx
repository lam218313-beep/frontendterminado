import React, { useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, FileText, AlertCircle, ExternalLink, X } from 'lucide-react';
import { useTasksContext } from '../hooks/useTasks';
import * as api from '../services/api';

// =============================================================================
// TYPES
// =============================================================================

interface RightSidebarProps {
  onNavigateToTasks: () => void;
  isOpen: boolean;      // New prop for toggle state
  onClose: () => void;  // New prop for closing (mobile/tablet)
}

// =============================================================================
// COMPONENT
// =============================================================================

export const RightSidebar: React.FC<RightSidebarProps> = ({ onNavigateToTasks, isOpen, onClose }) => {
  const { getPendingTasks, stats, isLoading } = useTasksContext();

  // Get first 5 pending tasks
  const tasks = getPendingTasks(5);

  // Calculate progress percentage
  const progressPercent = stats.total > 0
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

  // Calculate days remaining (could be based on sprint/week logic)
  const daysRemaining = 3;

  // WhatsApp link
  const whatsappLink = 'https://wa.me/51949268607';

  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <>
      {/* OVERLAY FOR MOBILE/TABLET */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 min-[1920px]:hidden transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* SIDEBAR CONTAINER */}
      <aside
        className={`
                flex flex-col shrink-0 overflow-x-hidden overflow-y-auto z-50 shadow-sm border border-gray-100 font-sans
                bg-white
                
                /* LARGE SCREENS (>= 1920px) - STATIC LAYOUT */
                min-[1920px]:w-[340px] min-[1920px]:h-[calc(100vh-2rem)] min-[1920px]:my-4 min-[1920px]:mr-4 min-[1920px]:p-8 min-[1920px]:rounded-[30px] min-[1920px]:relative min-[1920px]:translate-x-0 min-[1920px]:shadow-sm min-[1920px]:border min-[1920px]:flex
                
                /* SMALLER SCREENS (< 1920px) - FIXED OFF-CANVAS */
                fixed top-0 right-0 h-full w-[340px] p-6 shadow-2xl transition-transform duration-300 ease-out
                ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                min-[1920px]:translate-x-0
            `}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-brand-dark">Tareas</h2>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full min-[1920px]:hidden transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* General Status Card */}
        <div className="bg-brand-bg p-5 rounded-[24px] mb-8 relative group hover:shadow-md transition-all duration-300 border border-gray-100 shrink-0">
          {/* Decorative background circle */}
          <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/10 transition-colors pointer-events-none"></div>

          {/* Icon only */}
          <div className="flex justify-start items-start mb-4 relative z-10">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary-500 shadow-sm border border-primary-50">
              <Calendar size={20} strokeWidth={2.5} />
            </div>
          </div>

          <div className="relative z-10">
            <h3 className="font-bold text-brand-dark text-base mb-0.5">Estado General</h3>
            <p className="text-[11px] text-gray-500 font-medium mb-4">Progreso semanal de Tareas</p>

            {/* Progress Bar */}
            <div className="w-full bg-white h-2 rounded-full mb-2 overflow-hidden shadow-inner border border-gray-50">
              <div
                className="bg-primary-500 h-full rounded-full shadow-[0_0_10px_rgba(242,15,121,0.4)] transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[11px] font-bold mb-4">
              <span className="text-gray-600">{progressPercent}% Completado</span>
              <span className="text-primary-500">{daysRemaining} Días rest.</span>
            </div>

            <button
              onClick={onNavigateToTasks}
              className="w-full py-2.5 bg-white rounded-[14px] text-xs font-bold text-brand-dark shadow-sm border border-gray-100 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-95"
            >
              Ir a tareas
            </button>
          </div>
        </div>

        {/* Pending Tasks List */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-brand-dark text-base">Por Hacer</h3>
          <span className="text-[9px] font-bold text-primary-600 bg-primary-50 px-2 py-1 rounded-full border border-primary-100">
            {stats.pending + stats.inProgress} Pendientes
          </span>
        </div>

        <div className="space-y-1 flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400" />
              <p className="text-sm font-medium">¡Todo al día!</p>
            </div>
          ) : (
            tasks.map((task) => (
              <TaskItem key={task.id} task={task} onClick={onNavigateToTasks} />
            ))
          )}
        </div>

        {/* WhatsApp Contact Button */}
        <div className="mt-8 pt-6 border-t border-gray-50">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-4 px-5 rounded-[24px] border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex items-center justify-start gap-4 hover:bg-gray-50 hover:border-gray-200 transition-all group bg-white"
          >
            <div className="w-10 h-10 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
              {/* WhatsApp Icon */}
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div className="text-left flex-1">
              <span className="block text-sm font-bold text-brand-dark group-hover:text-gray-900">Contactar</span>
              <span className="block text-[10px] text-gray-400 font-medium group-hover:text-gray-500">Soporte directo</span>
            </div>
            <ExternalLink size={14} className="text-gray-300 group-hover:text-gray-400" />
          </a>
        </div>
      </aside>
    </>
  );
};

// =============================================================================
// TASK ITEM COMPONENT
// =============================================================================

interface TaskItemProps {
  task: api.Task;
  onClick: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onClick }) => {
  const getPriorityConfig = (urgencia: string | null, prioridad: number | null) => {
    // Map backend urgencia/prioridad to visual config
    if (urgencia === 'CRITICA' || (prioridad && prioridad >= 8)) {
      return { icon: AlertCircle, iconBg: 'bg-red-50', iconColor: 'text-red-500' };
    }
    if (urgencia === 'ALTA' || (prioridad && prioridad >= 5)) {
      return { icon: Clock, iconBg: 'bg-chart-yellow/10', iconColor: 'text-yellow-600' };
    }
    if (urgencia === 'MEDIA' || (prioridad && prioridad >= 3)) {
      return { icon: FileText, iconBg: 'bg-primary-50', iconColor: 'text-primary-600' };
    }
    return { icon: FileText, iconBg: 'bg-gray-100', iconColor: 'text-gray-600' };
  };

  const getStatusLabel = (status: api.TaskStatus) => {
    switch (status) {
      case 'EN_CURSO': return 'En progreso';
      case 'PENDIENTE': return 'Pendiente';
      case 'HECHO': return 'Completado';
      case 'REVISADO': return 'Revisado';
      default: return status;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const config = getPriorityConfig(task.urgencia, task.prioridad);
  const Icon = config.icon;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
    >
      <div className={`w-9 h-9 rounded-xl ${config.iconBg} ${config.iconColor} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
        <Icon size={16} strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-bold text-brand-dark truncate">{task.title}</h4>
        <p className="text-[10px] text-gray-400 font-medium">{getStatusLabel(task.status)}</p>
      </div>
      <span className="text-[9px] text-gray-400 font-semibold bg-gray-50 px-1.5 py-0.5 rounded-md">
        Sem {task.week}
      </span>
    </div>
  );
};