import { TaskCard } from './TaskCard';
import { FileX } from 'lucide-react';
import type { Task, TaskStatus, TaskPriority } from '@/types';

interface TaskGridProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onPriorityChange: (id: string, priority: TaskPriority) => void;
}

export function TaskGrid({ tasks, onEdit, onDelete, onStatusChange, onPriorityChange }: TaskGridProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <FileX className="h-12 w-12 mb-4 opacity-50" />
        <p className="text-lg font-medium">Nenhuma tarefa encontrada</p>
        <p className="text-sm">Adicione uma nova tarefa ou ajuste os filtros.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 sm:gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task.id)}
          onStatusChange={(status) => onStatusChange(task.id, status)}
          onPriorityChange={(priority) => onPriorityChange(task.id, priority)}
        />
      ))}
    </div>
  );
}
