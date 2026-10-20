import { Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { Project } from '@/types/projects';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, BLOQUEIO_TIPO_LABELS } from '@/types/projects';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}

export function ProjectCard({ project, onClick, onEdit, onDelete }: ProjectCardProps) {
  const createdDate = new Date(project.created_at).toLocaleDateString('pt-BR');

  return (
    <div
      onClick={onClick}
      className="group relative bg-card border border-border rounded-xl p-5 cursor-pointer transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Actions */}
      <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(e); }}
          className="p-1.5 rounded-md hover:bg-muted transition-colors"
          title="Editar projeto"
        >
          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(e); }}
          className="p-1.5 rounded-md hover:bg-destructive/20 transition-colors"
          title="Excluir projeto"
        >
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </button>
      </div>

      <h3 className="text-sm font-semibold text-foreground pr-16 truncate">{project.nome}</h3>
      <p className="text-xs text-muted-foreground mt-1">Criado em {createdDate}</p>

      {/* Status Badge */}
      <span
        className={cn(
          'inline-block mt-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wide',
          PROJECT_STATUS_COLORS[project.status]
        )}
      >
        {PROJECT_STATUS_LABELS[project.status]}
      </span>

      {/* Blocking reason below badge */}
      {project.status === 'bloqueado' && project.bloqueio_tipo && (
        <div className="mt-2 flex items-start gap-1.5 text-[11px] text-destructive">
          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" />
          <span className="line-clamp-2">
            {BLOQUEIO_TIPO_LABELS[project.bloqueio_tipo]}
            {project.bloqueio_motivo ? `: ${project.bloqueio_motivo}` : ''}
          </span>
        </div>
      )}

      {/* Progress */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] text-muted-foreground font-medium">Progresso</span>
          <span className="text-[11px] font-bold text-foreground">{project.progresso}%</span>
        </div>
        <Progress value={project.progresso} className="h-2" />
      </div>
    </div>
  );
}
