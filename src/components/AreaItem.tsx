import { Calendar, Pencil, Trash2, FolderOpen, Users, Layers, ListChecks } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Area } from '@/types';

interface AreaItemProps {
  area: Area;
  isActive: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function AreaItem({ area, isActive, onSelect, onEdit, onDelete }: AreaItemProps) {
  return (
    <li
      className={cn(
        "group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
      onClick={onSelect}
    >
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <FolderOpen className="h-4 w-4 shrink-0 opacity-70" />
        <span className="truncate text-sm font-medium">{area.nome}</span>
      </div>
      
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="p-1 rounded hover:bg-sidebar-border/50 transition-colors"
          title="Editar área"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded hover:bg-destructive/20 hover:text-destructive transition-colors"
          title="Excluir área"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </li>
  );
}

interface CalendarLinkProps {
  isActive: boolean;
  onSelect: () => void;
}

export function CalendarLink({ isActive, onSelect }: CalendarLinkProps) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 mb-2",
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
      onClick={onSelect}
    >
      <Calendar className="h-4 w-4 shrink-0" />
      <span className="text-sm font-medium">Visão Geral</span>
    </li>
  );
}

interface MeetingsLinkProps {
  isActive: boolean;
  onSelect: () => void;
}

export function MeetingsLink({ isActive, onSelect }: MeetingsLinkProps) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
      onClick={onSelect}
    >
      <Users className="h-4 w-4 shrink-0 opacity-70" />
      <span className="text-sm font-medium">Atas de Reuniões</span>
    </li>
  );
}

interface ProjectsLinkProps {
  isActive: boolean;
  onSelect: () => void;
}

export function ProjectsLink({ isActive, onSelect }: ProjectsLinkProps) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
      onClick={onSelect}
    >
      <Layers className="h-4 w-4 shrink-0 opacity-70" />
      <span className="text-sm font-medium">Projetos</span>
    </li>
  );
}

export function ActionsLink({ isActive, onSelect, badge = 0 }: ProjectsLinkProps & { badge?: number }) {
  return (
    <li
      className={cn(
        "flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
      )}
      onClick={onSelect}
    >
      <ListChecks className="h-4 w-4 shrink-0 opacity-70" />
      <span className="flex-1 text-sm font-medium">Ações</span>
      {badge > 0 && (
        <span className="shrink-0 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold tabular-nums text-primary-foreground">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </li>
  );
}
