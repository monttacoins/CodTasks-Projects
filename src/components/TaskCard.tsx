import { Calendar, User, Pencil, Trash2, Flag, CheckCircle2, Play, AlertTriangle, Clock } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { Task, TaskStatus, TaskPriority } from '@/types';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types';
import { getUrgencyLevel, getDaysUntilDeadline } from '@/lib/deadlineUtils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
  onPriorityChange: (priority: TaskPriority) => void;
}

const getPriorityColor = (priority: TaskPriority) => {
  switch (priority) {
    case 'Crítico': return 'text-red-500';
    case 'Alta': return 'text-orange-500';
    case 'Normal': return 'text-blue-500';
    case 'Baixa': return 'text-gray-400';
    default: return 'text-muted-foreground';
  }
};

export function TaskCard({ task, onEdit, onDelete, onStatusChange, onPriorityChange }: TaskCardProps) {
  const [isViewOpen, setIsViewOpen] = useState(false);
  const collaboratorName = task.collaborators?.name || 'Não Atribuído';
  const urgency = getUrgencyLevel(task);
  const daysUntilDeadline = getDaysUntilDeadline(task);
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const getDeadlineAlertText = () => {
    if (daysUntilDeadline === null || task.status === 'concluido') return null;
    if (daysUntilDeadline < 0) return `${Math.abs(daysUntilDeadline)}d atrasada`;
    if (daysUntilDeadline === 0) return 'Vence hoje!';
    if (daysUntilDeadline <= 3) return `${daysUntilDeadline}d restante${daysUntilDeadline !== 1 ? 's' : ''}`;
    return null;
  };

  const formatDateTime = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDateDisplay = () => {
    const startDate = formatDate(task.data_inicio);
    const endDate = formatDate(task.data);
    
    if (startDate && endDate) {
      return `${startDate} - ${endDate}`;
    } else if (endDate) {
      return endDate;
    } else if (startDate) {
      return `Início: ${startDate}`;
    }
    return 'Sem Data';
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent opening sheet when clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="combobox"]')) {
      return;
    }
    setIsViewOpen(true);
  };

  const handleEdit = () => {
    setIsViewOpen(false);
    onEdit();
  };

  const handleDelete = () => {
    setIsViewOpen(false);
    onDelete();
  };

  const deadlineAlert = getDeadlineAlertText();

  return (
    <>
      <div
        onClick={handleCardClick}
        className={cn(
          "bg-card rounded-lg p-3 sm:p-4 shadow-card hover:shadow-elevated transition-all duration-200 hover:-translate-y-0.5 animate-fade-in cursor-pointer relative",
          task.status === 'a_iniciar' && "task-status-a_iniciar",
          task.status === 'pendente' && "task-status-pendente",
          task.status === 'andamento' && "task-status-andamento",
          task.status === 'concluido' && "task-status-concluido",
          // Urgency border styling
          urgency === 'overdue' && "ring-2 ring-red-500 ring-offset-1 ring-offset-background",
          urgency === 'critical' && "ring-2 ring-orange-500 ring-offset-1 ring-offset-background",
          urgency === 'warning' && "ring-2 ring-yellow-500 ring-offset-1 ring-offset-background"
        )}
      >
        {/* Deadline Alert Badge */}
        {deadlineAlert && (
          <div className={cn(
            "absolute -top-2 -right-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shadow-md z-10",
            urgency === 'overdue' && "bg-red-500 text-white",
            urgency === 'critical' && "bg-orange-500 text-white animate-pulse",
            urgency === 'warning' && "bg-yellow-500 text-yellow-900"
          )}>
            {urgency === 'overdue' ? (
              <AlertTriangle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {deadlineAlert}
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <h3 className="font-semibold text-card-foreground leading-tight line-clamp-2">
            {task.titulo}
          </h3>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Editar tarefa"
            >
              <Pencil className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              title="Excluir tarefa"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {task.descricao || 'Nenhuma descrição.'}
        </p>

        {/* Footer */}
        <div className="flex flex-col gap-2 pt-3 border-t border-border">
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{getDateDisplay()}</span>
            </span>
            <span className="flex items-center gap-1">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{collaboratorName}</span>
            </span>
            <span className={cn("flex items-center gap-1", getPriorityColor(task.prioridade))}>
              <Flag className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{task.prioridade}</span>
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Select
              value={task.status}
              onValueChange={(value) => onStatusChange(value as TaskStatus)}
            >
              <SelectTrigger className="h-7 w-full text-xs px-2 py-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={task.prioridade}
              onValueChange={(value) => onPriorityChange(value as TaskPriority)}
            >
              <SelectTrigger className="h-7 w-full text-xs px-2 py-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value} className="text-xs">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Completion date - shown when task is completed */}
          {task.status === 'concluido' && task.data_conclusao && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 mt-1">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Concluído em: {formatDateTime(task.data_conclusao)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Read-only Task View Sheet */}
      <Sheet open={isViewOpen} onOpenChange={setIsViewOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="text-xl font-bold">{task.titulo}</SheetTitle>
          </SheetHeader>
          
          <div className="space-y-6">
            {/* Priority Badge */}
            <div className="flex items-center gap-2">
              <span className={cn(
                "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium",
                task.prioridade === 'Crítico' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                task.prioridade === 'Alta' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                task.prioridade === 'Normal' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                task.prioridade === 'Baixa' && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
              )}>
                <Flag className="h-3.5 w-3.5" />
                {task.prioridade}
              </span>
            </div>

            {/* Description */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h4>
              <p className="text-foreground">{task.descricao || 'Nenhuma descrição.'}</p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Play className="h-3.5 w-3.5 text-green-500" />
                  Data de Início
                </h4>
                <p className="text-foreground">{formatDate(task.data_inicio) || 'Não definida'}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <Flag className="h-3.5 w-3.5 text-red-500" />
                  Deadline
                </h4>
                <p className="text-foreground">{formatDate(task.data) || 'Não definida'}</p>
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Status</h4>
              <span className={cn(
                "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium",
                task.status === 'a_iniciar' && "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
                task.status === 'pendente' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
                task.status === 'andamento' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                task.status === 'concluido' && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              )}>
                {STATUS_LABELS[task.status]}
              </span>
            </div>

            {/* Completion date */}
            {task.status === 'concluido' && task.data_conclusao && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  Concluído em
                </h4>
                <p className="text-foreground">{formatDateTime(task.data_conclusao)}</p>
              </div>
            )}

            {/* Area */}
            {task.areas && (
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Área</h4>
                <p className="text-foreground">{task.areas.nome}</p>
              </div>
            )}

            {/* Collaborator */}
            <div>
              <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                Responsável
              </h4>
              <p className="text-foreground">{collaboratorName}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8 pt-4 border-t">
            <Button 
              onClick={handleEdit}
              className="flex-1"
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar Tarefa
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
