import { AlertTriangle, Clock, ChevronDown, ChevronUp, X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { getUrgentTasks, getDaysUntilDeadline, getUrgencyLevel } from '@/lib/deadlineUtils';
import type { Task } from '@/types';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface UrgentTasksPanelProps {
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onDismiss?: () => void;
}

const INITIAL_DISPLAY_COUNT = 5;

export function UrgentTasksPanel({ tasks, onTaskClick, onDismiss }: UrgentTasksPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const urgentTasks = getUrgentTasks(tasks, 3);
  
  if (urgentTasks.length === 0) return null;
  
  const overdueTasks = urgentTasks.filter(t => getDaysUntilDeadline(t)! < 0);
  const todayTasks = urgentTasks.filter(t => getDaysUntilDeadline(t) === 0);
  const upcomingTasks = urgentTasks.filter(t => {
    const days = getDaysUntilDeadline(t);
    return days !== null && days > 0 && days <= 3;
  });

  const getDeadlineText = (task: Task) => {
    const days = getDaysUntilDeadline(task);
    if (days === null) return '';
    if (days < 0) return `${Math.abs(days)} dia${Math.abs(days) !== 1 ? 's' : ''} atrasada`;
    if (days === 0) return 'Vence hoje';
    return `${days} dia${days !== 1 ? 's' : ''} restante${days !== 1 ? 's' : ''}`;
  };

  return (
    <div className={cn(
      "mb-4 rounded-lg border overflow-hidden transition-all",
      overdueTasks.length > 0 
        ? "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
        : "border-orange-300 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30"
    )}>
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <AlertTriangle className={cn(
            "h-5 w-5 animate-pulse",
            overdueTasks.length > 0 ? "text-red-500" : "text-orange-500"
          )} />
          <span className="font-semibold text-sm">
            {overdueTasks.length > 0 
              ? `${overdueTasks.length} tarefa${overdueTasks.length !== 1 ? 's' : ''} atrasada${overdueTasks.length !== 1 ? 's' : ''}`
              : `${urgentTasks.length} tarefa${urgentTasks.length !== 1 ? 's' : ''} urgente${urgentTasks.length !== 1 ? 's' : ''}`
            }
          </span>
          {todayTasks.length > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-red-500 text-white text-xs font-medium">
              {todayTasks.length} hoje
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onDismiss && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onDismiss();
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Tasks List */}
      {isExpanded && (
        <div className="px-4 pb-3 space-y-2">
          <ScrollArea className={cn(showAll && urgentTasks.length > INITIAL_DISPLAY_COUNT && "h-64")}>
            <div className="space-y-2 pr-2">
              {(showAll ? urgentTasks : urgentTasks.slice(0, INITIAL_DISPLAY_COUNT)).map((task) => {
                const urgency = getUrgencyLevel(task);
                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={cn(
                      "flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors",
                      urgency === 'overdue' && "bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900/60",
                      urgency === 'critical' && "bg-orange-100 hover:bg-orange-200 dark:bg-orange-900/40 dark:hover:bg-orange-900/60",
                      urgency === 'warning' && "bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/40 dark:hover:bg-yellow-900/60"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Clock className={cn(
                        "h-4 w-4 shrink-0",
                        urgency === 'overdue' && "text-red-600 dark:text-red-400",
                        urgency === 'critical' && "text-orange-600 dark:text-orange-400",
                        urgency === 'warning' && "text-yellow-600 dark:text-yellow-400"
                      )} />
                      <span className="font-medium text-sm truncate">{task.titulo}</span>
                      {task.areas && (
                        <span className="text-xs text-muted-foreground shrink-0 hidden sm:inline">
                          ({task.areas.nome})
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={cn(
                        "text-xs font-medium px-2 py-0.5 rounded-full",
                        urgency === 'overdue' && "bg-red-200 text-red-700 dark:bg-red-800 dark:text-red-200",
                        urgency === 'critical' && "bg-orange-200 text-orange-700 dark:bg-orange-800 dark:text-orange-200",
                        urgency === 'warning' && "bg-yellow-200 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200"
                      )}>
                        {getDeadlineText(task)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          
          {urgentTasks.length > INITIAL_DISPLAY_COUNT && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={(e) => {
                e.stopPropagation();
                setShowAll(!showAll);
              }}
            >
              {showAll ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Mostrar menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Ver todas as {urgentTasks.length} tarefas
                </>
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
