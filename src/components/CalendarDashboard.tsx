import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Plus, Pencil, Trash2, Play, Flag, Eye, EyeOff, X, FolderKanban } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ProjectTaskWithProject } from '@/hooks/useAllProjectTasks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import type { Task, TaskPriority } from '@/types';
import { STATUS_LABELS, PRIORITY_ORDER } from '@/types';
import type { TaskStatus } from '@/types';

const TASK_STATUS_BADGE_COLORS: Record<string, string> = {
  a_iniciar: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
  pendente: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  andamento: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  concluido: 'bg-green-500/20 text-green-400 border-green-500/30',
};

interface CalendarDashboardProps {
  tasks: Task[];
  projectTasks?: ProjectTaskWithProject[];
  onCreateTask: (date: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const WEEKDAY_NAMES = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

type TaskIndicator = {
  task: Task;
  type: 'start' | 'deadline';
};

type ProjectTaskIndicator = {
  projectTask: ProjectTaskWithProject;
  label: string; // "Projeto - Tarefa"
  color: string; // #c5c5c5, red, green
};

export function CalendarDashboard({ tasks, projectTasks = [], onCreateTask, onEditTask, onDeleteTask }: CalendarDashboardProps) {
  const [monthOffset, setMonthOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);
  const [viewingTask, setViewingTask] = useState<Task | null>(null);

  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  const currentYear = targetDate.getFullYear();
  const currentMonth = targetDate.getMonth();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();

  // Filter tasks based on showCompleted toggle
  const indicatorsByDate = useMemo(() => {
    const grouped: Record<string, TaskIndicator[]> = {};

    // Filter tasks based on toggle
    const filteredTasks = showCompleted ? tasks : tasks.filter(task => task.status !== 'concluido');

    filteredTasks.forEach(task => {
      // Add start date indicator
      if (task.data_inicio) {
        const startKey = task.data_inicio.substring(0, 10);
        if (!grouped[startKey]) grouped[startKey] = [];
        grouped[startKey].push({ task, type: 'start' });
      }

      // Add deadline indicator
      const deadline = task.data_fim || task.data;
      if (deadline) {
        const deadlineKey = deadline.substring(0, 10);
        if (!grouped[deadlineKey]) grouped[deadlineKey] = [];
        grouped[deadlineKey].push({ task, type: 'deadline' });
      }
    });

    // Sort each day's indicators by priority
    Object.keys(grouped).forEach(dateKey => {
      grouped[dateKey].sort((a, b) => {
        const priorityA = PRIORITY_ORDER[a.task.prioridade as TaskPriority] ?? 2;
        const priorityB = PRIORITY_ORDER[b.task.prioridade as TaskPriority] ?? 2;
        return priorityA - priorityB;
      });
    });

    return grouped;
  }, [tasks, showCompleted]);
  // Project tasks grouped by data_inicio date
  const projectIndicatorsByDate = useMemo(() => {
    const grouped: Record<string, ProjectTaskIndicator[]> = {};
    const now = new Date();
    const todayStr = now.toISOString().substring(0, 10);

    projectTasks.forEach(pt => {
      if (!pt.data_inicio) return;
      const dateKey = pt.data_inicio.substring(0, 10);
      const label = `${pt.project_nome} - ${pt.titulo}`;

      let color: string;
      if (pt.status === 'concluido') {
        color = '#22c55e'; // green
      } else if (pt.data_fim && pt.data_fim.substring(0, 10) < todayStr) {
        color = '#ef4444'; // red - past deadline
      } else {
        color = '#c5c5c5'; // gray - within range
      }

      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push({ projectTask: pt, label, color });
    });

    return grouped;
  }, [projectTasks]);


  const getTasksForDate = (dateKey: string): Task[] => {
    const indicators = indicatorsByDate[dateKey] || [];
    const uniqueTasks = new Map<string, Task>();
    indicators.forEach(ind => {
      uniqueTasks.set(ind.task.id, ind.task);
    });
    return Array.from(uniqueTasks.values());
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];
  const selectedDateProjectTasks = selectedDate ? (projectIndicatorsByDate[selectedDate] || []) : [];

  const formatDateDisplay = (dateKey: string) => {
    const date = new Date(dateKey + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  };


  return (
    <div className="animate-fade-in">
      {/* Navigation Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonthOffset(prev => prev - 1)}
            className="gap-1"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </Button>
          
          <h2 className="text-base sm:text-xl font-bold text-foreground text-center flex-1 sm:flex-none sm:mx-4">
            {MONTH_NAMES[currentMonth]} {currentYear}
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMonthOffset(prev => prev + 1)}
            className="gap-1"
          >
            <span className="hidden sm:inline">Próximo</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCompleted(prev => !prev)}
          className="gap-1 w-full sm:w-auto"
        >
          {showCompleted ? (
            <>
              <EyeOff className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Ocultar Concluídas</span>
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Mostrar Concluídas</span>
            </>
          )}
        </Button>
      </div>

      {/* Legend */}
      <div className="mb-4 p-3 rounded-lg bg-card border border-border shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          {/* Status Legend */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Status:</span>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--status-to-start))]" />
              <span className="text-xs text-muted-foreground">A iniciar</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--status-pending))]" />
              <span className="text-xs text-muted-foreground">Pendente</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--status-progress))]" />
              <span className="text-xs text-muted-foreground">Em andamento</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--status-done))]" />
              <span className="text-xs text-muted-foreground">Concluído</span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-border" />

          {/* Priority Legend */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Prioridade:</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium">Crítico</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 font-medium">Alta</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">Normal</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 font-medium">Baixa</span>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-border" />

          {/* Icons Legend */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Play className="h-3 w-3 fill-green-500 text-green-500" />
              <span className="text-xs text-muted-foreground">Início</span>
            </div>
            <div className="flex items-center gap-1">
              <Flag className="h-3 w-3 text-red-500" />
              <span className="text-xs text-muted-foreground">Deadline</span>
            </div>
          </div>

          {/* Divider */}
          <div className="hidden sm:block w-px h-6 bg-border" />

          {/* Project Tasks Legend */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground mr-1">Projetos:</span>
            <div className="flex items-center gap-1">
              <FolderKanban className="h-3 w-3" style={{ color: '#c5c5c5' }} />
              <span className="text-xs text-muted-foreground">No prazo</span>
            </div>
            <div className="flex items-center gap-1">
              <FolderKanban className="h-3 w-3 text-red-500" />
              <span className="text-xs text-muted-foreground">Atrasada</span>
            </div>
            <div className="flex items-center gap-1">
              <FolderKanban className="h-3 w-3 text-green-500" />
              <span className="text-xs text-muted-foreground">Concluída</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg overflow-hidden border border-border shadow-card overflow-x-auto">
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 min-w-[500px]">
          {WEEKDAY_NAMES.map(day => (
            <div
              key={day}
              className="px-1 sm:px-2 py-2 sm:py-3 text-center text-xs sm:text-sm font-semibold bg-muted text-muted-foreground border-b border-border"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 min-w-[500px]">
          {/* Empty cells for days before first day of month */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[70px] sm:min-h-[100px] bg-muted/30 border border-border/30" />
          ))}
          
          {/* Actual days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayString = day < 10 ? '0' + day : String(day);
            const monthString = (currentMonth + 1) < 10 ? '0' + (currentMonth + 1) : String(currentMonth + 1);
            const dateKey = `${currentYear}-${monthString}-${dayString}`;
            
            const dayIndicators = indicatorsByDate[dateKey] || [];
            const dayProjectIndicators = projectIndicatorsByDate[dateKey] || [];
            const totalIndicators = dayIndicators.length + dayProjectIndicators.length;
            const isToday = day === now.getDate() && monthOffset === 0;

            return (
              <div
                key={day}
                className={cn(
                  "min-h-[70px] sm:min-h-[100px] p-1 sm:p-2 bg-card border border-border/50 cursor-pointer transition-colors hover:bg-muted/50",
                  isToday && "ring-2 ring-primary ring-inset"
                )}
                onClick={() => setSelectedDate(dateKey)}
              >
                <span className={cn(
                  "inline-flex items-center justify-center w-5 h-5 sm:w-7 sm:h-7 text-xs sm:text-sm font-medium rounded-full",
                  isToday && "bg-primary text-primary-foreground"
                )}>
                  {day}
                </span>
                
                <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1">
                  {dayIndicators.slice(0, 3).map((indicator, idx) => (
                    <div
                      key={`${indicator.task.id}-${indicator.type}-${idx}`}
                      className="flex items-center gap-0.5"
                      title={`${indicator.type === 'start' ? '🚀 Início' : '🏁 Deadline'}: ${indicator.task.titulo}`}
                    >
                      {indicator.type === 'start' ? (
                        <Play className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-green-500 text-green-500 shrink-0" />
                      ) : (
                        <Flag className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500 shrink-0" />
                      )}
                      <span className={cn(
                        "text-[8px] sm:text-[10px] truncate max-w-[40px] sm:max-w-[80px]",
                        indicator.type === 'start' ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                      )}>
                        {indicator.task.titulo}
                      </span>
                    </div>
                  ))}
                  {dayProjectIndicators.slice(0, Math.max(0, 3 - dayIndicators.length)).map((pi, idx) => (
                    <div
                      key={`pt-${pi.projectTask.id}-${idx}`}
                      className="flex items-center gap-0.5"
                      title={pi.label}
                    >
                      <FolderKanban className="h-2.5 w-2.5 sm:h-3 sm:w-3 shrink-0" style={{ color: pi.color }} />
                      <span className="text-[8px] sm:text-[10px] truncate max-w-[40px] sm:max-w-[80px]" style={{ color: pi.color }}>
                        {pi.projectTask.titulo}
                      </span>
                    </div>
                  ))}
                  {totalIndicators > 3 && (
                    <span className="text-[8px] sm:text-[10px] text-muted-foreground">+{totalIndicators - 3}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Detail Modal */}
      <Dialog open={selectedDate !== null} onOpenChange={(open) => !open && setSelectedDate(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Tarefas de {selectedDate && formatDateDisplay(selectedDate)}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-3 max-h-[400px] overflow-y-auto">
            {selectedDateTasks.length === 0 && selectedDateProjectTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhuma tarefa agendada para este dia.
              </p>
            ) : (
              <>
                {selectedDateTasks.map((task) => (
                  <div
                    key={task.id}
                    className={cn(
                      "p-3 rounded-lg border-l-4 bg-muted/30 group cursor-pointer hover:bg-muted/50 transition-colors",
                      task.status === 'a_iniciar' && "border-l-[hsl(var(--status-to-start))]",
                      task.status === 'pendente' && "border-l-status-pending",
                      task.status === 'andamento' && "border-l-status-progress",
                      task.status === 'concluido' && "border-l-status-done"
                    )}
                    onClick={() => setViewingTask(task)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-foreground">{task.titulo}</h4>
                          <span className={cn(
                            "text-xs px-1.5 py-0.5 rounded font-medium",
                            task.prioridade === 'Crítico' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                            task.prioridade === 'Alta' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                            task.prioridade === 'Normal' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                            task.prioridade === 'Baixa' && "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                          )}>
                            {task.prioridade}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs mt-1">
                          {task.data_inicio && (
                            <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                              <Play className="h-3 w-3 fill-current" />
                              Início: {new Date(task.data_inicio).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                          {(task.data_fim || task.data) && (
                            <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                              <Flag className="h-3 w-3" />
                              Deadline: {new Date((task.data_fim || task.data)!).toLocaleDateString('pt-BR')}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Status: {STATUS_LABELS[task.status]}
                        </p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(null);
                            onEditTask(task);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedDate(null);
                            onDeleteTask(task.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Project Tasks */}
                {selectedDateProjectTasks.length > 0 && (
                  <>
                    {selectedDateTasks.length > 0 && (
                      <div className="flex items-center gap-2 pt-2">
                        <FolderKanban className="h-4 w-4 text-muted-foreground" />
                        <span className="text-xs font-semibold text-muted-foreground">Tarefas de Projetos</span>
                      </div>
                    )}
                    {selectedDateProjectTasks.map((pi) => (
                      <div
                        key={pi.projectTask.id}
                        className="p-3 rounded-lg bg-muted/30 border-l-4"
                        style={{ borderLeftColor: pi.color }}
                      >
                        <div className="flex items-center gap-2">
                          <FolderKanban className="h-4 w-4 shrink-0" style={{ color: pi.color }} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-muted-foreground">{pi.projectTask.project_nome}</p>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-foreground text-sm">{pi.projectTask.titulo}</h4>
                              <Badge className={cn("text-[10px] px-1.5 py-0", TASK_STATUS_BADGE_COLORS[pi.projectTask.status] || '')}>
                                {STATUS_LABELS[pi.projectTask.status as TaskStatus] || pi.projectTask.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {pi.projectTask.data_fim && (
                          <p className="text-xs text-muted-foreground mt-1 ml-6">
                            Prazo: {new Date(pi.projectTask.data_fim).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>

          {/* Add Task Button */}
          <div className="pt-2 border-t border-border">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={() => {
                if (selectedDate) {
                  setSelectedDate(null);
                  onCreateTask(selectedDate);
                }
              }}
            >
              <Plus className="h-4 w-4" />
              Nova Tarefa nesta Data
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task View Sheet (Read-only) */}
      <Sheet open={viewingTask !== null} onOpenChange={(open) => !open && setViewingTask(null)}>
        <SheetContent className="sm:max-w-[500px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <span className={cn(
                "w-3 h-3 rounded-full",
                viewingTask?.status === 'a_iniciar' && "bg-[hsl(var(--status-to-start))]",
                viewingTask?.status === 'pendente' && "bg-status-pending",
                viewingTask?.status === 'andamento' && "bg-status-progress",
                viewingTask?.status === 'concluido' && "bg-status-done"
              )} />
              {viewingTask?.titulo}
            </SheetTitle>
          </SheetHeader>
          
          {viewingTask && (
            <div className="py-6 space-y-6">
              {/* Priority Badge */}
              <div>
                <span className={cn(
                  "text-sm px-3 py-1.5 rounded-full font-medium",
                  viewingTask.prioridade === 'Crítico' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                  viewingTask.prioridade === 'Alta' && "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
                  viewingTask.prioridade === 'Normal' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                  viewingTask.prioridade === 'Baixa' && "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                )}>
                  Prioridade: {viewingTask.prioridade}
                </span>
              </div>

              {/* Description */}
              {viewingTask.descricao && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Descrição</h4>
                  <p className="text-foreground">{viewingTask.descricao}</p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                {viewingTask.data_inicio && (
                  <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                      <Play className="h-4 w-4 fill-current" />
                      <span className="text-xs font-medium">Data de Início</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date(viewingTask.data_inicio).toLocaleDateString('pt-BR', { 
                        day: '2-digit', month: 'long', year: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
                {(viewingTask.data_fim || viewingTask.data) && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-1">
                      <Flag className="h-4 w-4" />
                      <span className="text-xs font-medium">Deadline</span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {new Date((viewingTask.data_fim || viewingTask.data)!).toLocaleDateString('pt-BR', { 
                        day: '2-digit', month: 'long', year: 'numeric' 
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Status */}
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Status</h4>
                <span className={cn(
                  "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium",
                  viewingTask.status === 'a_iniciar' && "bg-[hsl(var(--status-to-start))]/10 text-[hsl(var(--status-to-start))]",
                  viewingTask.status === 'pendente' && "bg-status-pending/10 text-status-pending",
                  viewingTask.status === 'andamento' && "bg-status-progress/10 text-status-progress",
                  viewingTask.status === 'concluido' && "bg-status-done/10 text-status-done"
                )}>
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    viewingTask.status === 'a_iniciar' && "bg-[hsl(var(--status-to-start))]",
                    viewingTask.status === 'pendente' && "bg-status-pending",
                    viewingTask.status === 'andamento' && "bg-status-progress",
                    viewingTask.status === 'concluido' && "bg-status-done"
                  )} />
                  {STATUS_LABELS[viewingTask.status]}
                </span>
              </div>

              {/* Area & Assignee */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Área</h4>
                  <p className="text-foreground">{viewingTask.areas?.nome || 'Sem Área'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">Responsável</h4>
                  <p className="text-foreground">{viewingTask.collaborators?.name || 'Não Atribuído'}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t border-border">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => {
                    const task = viewingTask;
                    setViewingTask(null);
                    setSelectedDate(null);
                    onEditTask(task);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                  Editar Tarefa
                </Button>
                <Button
                  variant="outline"
                  className="text-destructive hover:text-destructive gap-2"
                  onClick={() => {
                    const taskId = viewingTask.id;
                    setViewingTask(null);
                    setSelectedDate(null);
                    onDeleteTask(taskId);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  Excluir
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
