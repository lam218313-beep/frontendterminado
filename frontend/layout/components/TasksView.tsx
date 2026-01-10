/**
 * Pixely Partners - Tasks View
 * 
 * Main view for task management with Kanban board
 * Note: KanbanBoard currently uses mock data. Future integration with useTasks hook pending.
 */

import React from 'react';
import { KanbanBoard } from './KanbanBoard';

import { WorkflowStepper } from './WorkflowStepper';

export const TasksView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  // Future: Connect KanbanBoard to useTasksContext for API data
  // const { tasks, isLoading, error, updateTaskStatus, stats, refreshTasks } = useTasksContext();

  return (
    <div className="h-full w-full flex flex-col p-6 animate-fade-in-up bg-brand-bg">
      <div className="max-w-7xl mx-auto w-full">
        <WorkflowStepper currentStep={5} onNavigate={onNavigate} />
        <KanbanBoard />
      </div>
    </div>
  );
};
