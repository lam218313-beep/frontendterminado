/**
 * Pixely Partners - Tasks View
 * 
 * Main view for task management with Kanban board
 */

import React from 'react';
import { KanbanBoard } from './KanbanBoard';
import { WorkflowStepper } from './WorkflowStepper';
import { AnimatedHeaderCard } from './AnimatedHeaderCard';

export const TasksView: React.FC<{ onNavigate: (view: string) => void }> = ({ onNavigate }) => {
  return (
    <div className="h-full w-full flex flex-col p-6 animate-fade-in-up bg-brand-bg">
      <div className="max-w-7xl mx-auto w-full">
        <WorkflowStepper currentStep={5} onNavigate={onNavigate} />

        <AnimatedHeaderCard
          supertitle="Fase 5: Ejecución"
          title="Planificación"
          subtitle="Calendario de contenidos y tareas."
        />

        <KanbanBoard />
      </div>
    </div>
  );
};
