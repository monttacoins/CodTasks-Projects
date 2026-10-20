import { Calendar, Pencil, Trash2, Flag, CheckCircle2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectTask } from '@/types/projects';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types';
import type { TaskStatus, TaskPriority } from '@/types';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProjectTaskCardProps {
  task: ProjectTask;
  collaboratorName?: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  onStatusChange: (status: ProjectTask['status']) => void;
  onPriorityChange: (priority: ProjectTask['prioridade']) => void;
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Crítico': return 'text-red-500';
    case 'Alta': return 'text-orange-500';
    case 'Normal': return 'text-blue-500';
    case 'Baixa': return 'text-gray-400';
    default: return 'text-muted-foreground';
  }
};

const STATUS_BADGE_COLORS: Record<string, string> = {
  a_iniciar: 'bg-[#c5c5c5]/20 text-[#c5c5c5] border-[#c5c5c5]/30',
  pendente: 'bg-[#c5c5c5]/20 text-[#c5c5c5] border-[#c5c5c5]/30',
  andamento: 'bg-[#c5c5c5]/20 text-[#c5c5c5] border-[#c5c5c5]/30',
  concluido: 'bg-green-500/20 text-green-500 border-green-500/30',
};

export function ProjectTaskCard({ task, collaboratorName, onEdit, onDelete, onClick, onStatusChange, onPriorityChange }: ProjectTaskCardProps) {
  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : null;

  const getDateDisplay = () => {
    const start = formatDate(task.data_inicio);
    const end = formatDate(task.data_fim);
    if (start && end) return `${start} - ${end}`;
    if (end) return end;
    if (start) return `Início: ${start}`;
    return 'Sem Data';
  };

  const isOverdue = () => {
    if (task.status === 'concluido') return false;
    if (!task.data_fim) return false;
    return new Date(task.data_fim) < new Date(new Date().toISOString().substring(0, 10));
  };

  const getBadgeColor = () => {
    if (task.status === 'concluido') return 'bg-green-500/20 text-green-500 border-green-500/30';
    if (isOverdue()) return 'bg-red-500/20 text-red-500 border-red-500/30';
    return 'bg-[#c5c5c5]/20 text-[#c5c5c5] border-[#c5c5c5]/30';
  };

  const formatConclusao = (d?: string) => {
    if (!d) return null;
    const date = new Date(d);
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-card rounded-lg p-3 sm:p-4 shadow-card hover:shadow-elevated transition-all duration-200 hover:-translate-y-0.5 animate-fade-in relative cursor-pointer",
        task.status === 'concluido' && 'opacity-70'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold text-card-foreground leading-tight line-clamp-2">{task.titulo}</h3>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors" title="Editar">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors" title="Excluir">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-3">
        <Badge className={cn("text-[10px] px-1.5 py-0 font-medium", getBadgeColor())}>
          {STATUS_LABELS[task.status as TaskStatus] || task.status}
        </Badge>
      </div>

      {task.status === 'concluido' && task.data_conclusao && (
        <div className="flex items-center gap-1.5 text-xs text-green-500 mb-2">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
          <span>Concluído em {formatConclusao(task.data_conclusao)}</span>
        </div>
      )}

      {task.descricao && (
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{task.descricao}</p>
      )}

      <div className="flex flex-col gap-2 pt-3 border-t border-border">
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            <span>{getDateDisplay()}</span>
          </span>
          <span className={cn("flex items-center gap-1", getPriorityColor(task.prioridade))}>
            <Flag className="h-3.5 w-3.5 shrink-0" />
            <span>{task.prioridade}</span>
          </span>
          {collaboratorName && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <User className="h-3.5 w-3.5 shrink-0" />
              <span>{collaboratorName}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2" onClick={(e) => e.stopPropagation()}>
          <Select value={task.status} onValueChange={(v) => onStatusChange(v as ProjectTask['status'])}>
            <SelectTrigger className="h-7 w-full text-xs px-2 py-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([val, label]) => (
                <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={task.prioridade} onValueChange={(v) => onPriorityChange(v as ProjectTask['prioridade'])}>
            <SelectTrigger className="h-7 w-full text-xs px-2 py-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([val, label]) => (
                <SelectItem key={val} value={val} className="text-xs">{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
