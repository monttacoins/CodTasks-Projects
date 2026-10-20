import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flag, CheckCircle2, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProjectTask } from '@/types/projects';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types';
import type { TaskStatus, Collaborator } from '@/types';

interface ProjectTaskDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ProjectTask | null;
  collaborators: Collaborator[];
}

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'Crítico': return 'text-red-500';
    case 'Alta': return 'text-orange-500';
    case 'Normal': return 'text-blue-500';
    case 'Baixa': return 'text-muted-foreground';
    default: return 'text-muted-foreground';
  }
};

const STATUS_BADGE_COLORS: Record<string, string> = {
  a_iniciar: 'bg-[#c5c5c5]/20 text-[#c5c5c5] border-[#c5c5c5]/30',
  pendente: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  andamento: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  concluido: 'bg-green-500/20 text-green-500 border-green-500/30',
};

export function ProjectTaskDetailModal({ open, onOpenChange, task, collaborators }: ProjectTaskDetailModalProps) {
  if (!task) return null;

  const collaboratorName = task.collaborator_id
    ? collaborators.find(c => String(c.id) === String(task.collaborator_id))?.name
    : null;

  const formatDate = (d?: string) => d ? new Date(d).toLocaleDateString('pt-BR') : null;

  const formatConclusao = (d?: string) => {
    if (!d) return null;
    const date = new Date(d);
    return `${date.toLocaleDateString('pt-BR')} às ${date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const getDateDisplay = () => {
    const start = formatDate(task.data_inicio);
    const end = formatDate(task.data_fim);
    if (start && end) return `${start} - ${end}`;
    if (end) return end;
    if (start) return `Início: ${start}`;
    return 'Sem Data';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg leading-tight">{task.titulo}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Status & Prioridade */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={cn("text-xs px-2 py-0.5 font-medium", STATUS_BADGE_COLORS[task.status])}>
              {STATUS_LABELS[task.status as TaskStatus] || task.status}
            </Badge>
            <span className={cn("flex items-center gap-1 text-xs font-medium", getPriorityColor(task.prioridade))}>
              <Flag className="h-3.5 w-3.5" />
              {task.prioridade}
            </span>
          </div>

          {/* Conclusão */}
          {task.status === 'concluido' && task.data_conclusao && (
            <div className="flex items-center gap-1.5 text-xs text-green-500">
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
              <span>Concluído em {formatConclusao(task.data_conclusao)}</span>
            </div>
          )}

          {/* Datas */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>{getDateDisplay()}</span>
          </div>

          {/* Responsável */}
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <User className="h-4 w-4 shrink-0" />
            <span>{collaboratorName || 'Sem responsável'}</span>
          </div>

          {/* Descrição */}
          {task.descricao && (
            <div>
              <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Descrição</h4>
              <p className="text-sm text-foreground whitespace-pre-wrap">{task.descricao}</p>
            </div>
          )}

          {/* Observações */}
          <div>
            <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">Observações</h4>
            {task.observacoes ? (
              <p className="text-sm text-foreground whitespace-pre-wrap">{task.observacoes}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">Nenhuma observação registrada.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
