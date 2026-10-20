import { useState } from 'react';
import { Search, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';
import type { Collaborator, Area } from '@/types';

export interface CalendarFiltersState {
  search: string;
  collaboratorId: string;
  areaId: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

export const emptyCalendarFilters: CalendarFiltersState = {
  search: '',
  collaboratorId: '',
  areaId: '',
  startDate: undefined,
  endDate: undefined,
};

interface CalendarFiltersBarProps {
  filters: CalendarFiltersState;
  collaborators: Collaborator[];
  areas: Area[];
  onFilterChange: (filters: CalendarFiltersState) => void;
  onClear: () => void;
}

export function CalendarFiltersBar({ filters, collaborators, areas, onFilterChange, onClear }: CalendarFiltersBarProps) {
  const updateFilter = <K extends keyof CalendarFiltersState>(key: K, value: CalendarFiltersState[K]) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const hasActiveFilters = filters.search || filters.collaboratorId || filters.areaId || filters.startDate || filters.endDate;

  return (
    <div className="flex flex-col gap-3 p-3 sm:p-4 bg-card rounded-lg shadow-card mb-4 sm:mb-6">
      {/* Search */}
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
        {/* Collaborator Filter */}
        <Select
          value={filters.collaboratorId || "all"}
          onValueChange={(value) => updateFilter('collaboratorId', value === "all" ? '' : value)}
        >
          <SelectTrigger className="w-[140px] sm:w-[170px] text-xs sm:text-sm">
            <SelectValue placeholder="Responsável" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Responsáveis</SelectItem>
            {collaborators.map((collab) => (
              <SelectItem key={collab.id} value={collab.id}>
                {collab.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Area Filter */}
        <Select
          value={filters.areaId || "all"}
          onValueChange={(value) => updateFilter('areaId', value === "all" ? '' : value)}
        >
          <SelectTrigger className="w-[140px] sm:w-[170px] text-xs sm:text-sm">
            <SelectValue placeholder="Área" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Áreas</SelectItem>
            {areas.map((area) => (
              <SelectItem key={area.id} value={area.id}>
                {area.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Date Range - Start */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] sm:w-[160px] justify-start text-left font-normal text-xs sm:text-sm",
                !filters.startDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              {filters.startDate ? format(filters.startDate, "dd/MM/yyyy") : "Data início"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.startDate}
              onSelect={(date) => updateFilter('startDate', date)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

        {/* Date Range - End */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[140px] sm:w-[160px] justify-start text-left font-normal text-xs sm:text-sm",
                !filters.endDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-1.5 h-3.5 w-3.5" />
              {filters.endDate ? format(filters.endDate, "dd/MM/yyyy") : "Data fim"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={filters.endDate}
              onSelect={(date) => updateFilter('endDate', date)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>

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

import type { Task } from '@/types';

export function filterCalendarTasks(tasks: Task[], filters: CalendarFiltersState): Task[] {
  return tasks.filter(task => {
    // Search filter
    const matchesSearch = !filters.search ||
      task.titulo.toLowerCase().includes(filters.search.toLowerCase()) ||
      (task.descricao && task.descricao.toLowerCase().includes(filters.search.toLowerCase()));

    // Collaborator filter
    const matchesCollaborator = !filters.collaboratorId || task.collaborator_id === filters.collaboratorId;

    // Area filter
    const matchesArea = !filters.areaId || task.area_id === filters.areaId;

    // Date range filter
    let matchesDate = true;
    if (filters.startDate || filters.endDate) {
      const taskDeadline = task.data || task.data_fim;
      const taskStart = task.data_inicio;
      
      // Task matches if any of its dates fall within the range
      const dates = [taskDeadline, taskStart].filter(Boolean).map(d => d!.substring(0, 10));
      
      if (dates.length === 0) {
        matchesDate = false;
      } else {
        const startStr = filters.startDate ? format(filters.startDate, 'yyyy-MM-dd') : '';
        const endStr = filters.endDate ? format(filters.endDate, 'yyyy-MM-dd') : '';
        
        matchesDate = dates.some(d => {
          if (startStr && d < startStr) return false;
          if (endStr && d > endStr) return false;
          return true;
        });
      }
    }

    return matchesSearch && matchesCollaborator && matchesArea && matchesDate;
  });
}
