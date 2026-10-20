import { Search, X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Collaborator, TaskStatus, Task, TaskPriority } from '@/types';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types';

export interface TaskFilters {
  search: string;
  startDate: string;
  endDate: string;
  status: TaskStatus | '';
  priority: TaskPriority | '';
  collaboratorId: string;
}

interface TaskFiltersBarProps {
  filters: TaskFilters;
  collaborators: Collaborator[];
  onFilterChange: (filters: TaskFilters) => void;
  onClear: () => void;
}

export function TaskFiltersBar({ filters, collaborators, onFilterChange, onClear }: TaskFiltersBarProps) {
  const updateFilter = <K extends keyof TaskFilters>(key: K, value: TaskFilters[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = filters.search || filters.startDate || filters.endDate || filters.status || filters.priority || filters.collaboratorId;

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4 bg-card rounded-lg shadow-card mb-4 sm:mb-6">
      {/* Search - Full Width */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar tarefa..."
          value={filters.search}
          onChange={(e) => updateFilter('search', e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Filters Row */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Date Range */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <Input
            type="date"
            value={filters.startDate}
            onChange={(e) => updateFilter('startDate', e.target.value)}
            className="w-[130px] text-xs sm:text-sm"
            title="Data de início"
          />
          <span className="text-muted-foreground text-xs">até</span>
          <Input
            type="date"
            value={filters.endDate}
            onChange={(e) => updateFilter('endDate', e.target.value)}
            className="w-[130px] text-xs sm:text-sm"
            title="Data final"
          />
        </div>

        {/* Status Filter */}
        <Select
          value={filters.status || "all"}
          onValueChange={(value) => updateFilter('status', value === "all" ? '' : value as TaskStatus)}
        >
          <SelectTrigger className="w-[120px] sm:w-[140px] text-xs sm:text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Priority Filter */}
        <Select
          value={filters.priority || "all"}
          onValueChange={(value) => updateFilter('priority', value === "all" ? '' : value as TaskPriority)}
        >
          <SelectTrigger className="w-[120px] sm:w-[140px] text-xs sm:text-sm">
            <SelectValue placeholder="Prioridade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Prioridades</SelectItem>
            {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Collaborator Filter */}
        <Select
          value={filters.collaboratorId || "all"}
          onValueChange={(value) => updateFilter('collaboratorId', value === "all" ? '' : value)}
        >
          <SelectTrigger className="w-[120px] sm:w-[160px] text-xs sm:text-sm">
            <SelectValue placeholder="Colaborador" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            {collaborators.map((collab) => (
              <SelectItem key={collab.id} value={collab.id}>
                {collab.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Button */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClear} className="gap-1 text-xs">
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Limpar</span>
          </Button>
        )}
      </div>
    </div>
  );
}

export const emptyFilters: TaskFilters = {
  search: '',
  startDate: '',
  endDate: '',
  status: '',
  priority: '',
  collaboratorId: ''
};

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  return tasks.filter(task => {
    // Search filter
    const matchesSearch = !filters.search || 
      task.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
      (task.descricao && task.descricao.toLowerCase().includes(filters.search.toLowerCase()));

    // Status filter
    const matchesStatus = !filters.status || task.status === filters.status;

    // Priority filter
    const matchesPriority = !filters.priority || task.prioridade === filters.priority;

    // Collaborator filter
    const matchesCollaborator = !filters.collaboratorId || task.collaborator_id === filters.collaboratorId;

    // Date range filter
    let matchesDate = true;
    if (task.data && (filters.startDate || filters.endDate)) {
      const taskDate = task.data.substring(0, 10);
      if (filters.startDate && taskDate < filters.startDate) matchesDate = false;
      if (filters.endDate && taskDate > filters.endDate) matchesDate = false;
    } else if (!task.data && (filters.startDate || filters.endDate)) {
      matchesDate = false;
    }

    return matchesSearch && matchesStatus && matchesPriority && matchesCollaborator && matchesDate;
  });
}
