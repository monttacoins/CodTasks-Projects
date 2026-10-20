import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { getUrgentTasks, getDaysUntilDeadline } from '@/lib/deadlineUtils';
import type { Task } from '@/types';

/**
 * Hook to show toast notification about urgent tasks when app loads
 */
export function useDeadlineAlerts(tasks: Task[]) {
  const hasShownToast = useRef(false);

  useEffect(() => {
    // Only show once per session and when tasks are loaded
    if (hasShownToast.current || tasks.length === 0) return;
    
    const urgentTasks = getUrgentTasks(tasks, 3);
    if (urgentTasks.length === 0) return;

    hasShownToast.current = true;

    const overdueTasks = urgentTasks.filter(t => getDaysUntilDeadline(t)! < 0);
    const todayTasks = urgentTasks.filter(t => getDaysUntilDeadline(t) === 0);
    const upcomingTasks = urgentTasks.filter(t => {
      const days = getDaysUntilDeadline(t);
      return days !== null && days > 0 && days <= 3;
    });

    // Show toast with summary
    setTimeout(() => {
      if (overdueTasks.length > 0) {
        toast.error('Atenção: Tarefas Atrasadas!', {
          description: `${overdueTasks.length} tarefa${overdueTasks.length !== 1 ? 's' : ''} passou do prazo${todayTasks.length > 0 ? `, ${todayTasks.length} vence${todayTasks.length !== 1 ? 'm' : ''} hoje` : ''}.`,
          duration: 8000,
        });
      } else if (todayTasks.length > 0) {
        toast.warning('Tarefas Vencem Hoje!', {
          description: `${todayTasks.length} tarefa${todayTasks.length !== 1 ? 's' : ''} vence${todayTasks.length !== 1 ? 'm' : ''} hoje.`,
          duration: 6000,
        });
      } else if (upcomingTasks.length > 0) {
        toast.info('Tarefas Próximas do Prazo', {
          description: `${upcomingTasks.length} tarefa${upcomingTasks.length !== 1 ? 's' : ''} vence${upcomingTasks.length !== 1 ? 'm' : ''} em até 3 dias.`,
          duration: 5000,
        });
      }
    }, 1500); // Delay to let the app render first
  }, [tasks]);
}
