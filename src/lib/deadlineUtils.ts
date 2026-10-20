import type { Task } from '@/types';

/**
 * Check if a task is approaching its deadline (within given days)
 */
export function isApproachingDeadline(task: Task, daysThreshold: number = 3): boolean {
  if (!task.data || task.status === 'concluido') return false;
  
  const deadline = new Date(task.data);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  
  const diffTime = deadline.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= 0 && diffDays <= daysThreshold;
}

/**
 * Check if a task is overdue
 */
export function isOverdue(task: Task): boolean {
  if (!task.data || task.status === 'concluido') return false;
  
  const deadline = new Date(task.data);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  
  return deadline.getTime() < today.getTime();
}

/**
 * Get days until deadline (negative if overdue)
 */
export function getDaysUntilDeadline(task: Task): number | null {
  if (!task.data) return null;
  
  const deadline = new Date(task.data);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  
  const diffTime = deadline.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get tasks approaching deadline (within threshold) that are not completed
 */
export function getUrgentTasks(tasks: Task[], daysThreshold: number = 3): Task[] {
  return tasks.filter(task => {
    if (task.status === 'concluido') return false;
    return isApproachingDeadline(task, daysThreshold) || isOverdue(task);
  }).sort((a, b) => {
    const daysA = getDaysUntilDeadline(a) ?? Infinity;
    const daysB = getDaysUntilDeadline(b) ?? Infinity;
    return daysA - daysB;
  });
}

/**
 * Get urgency level for display styling
 */
export function getUrgencyLevel(task: Task): 'overdue' | 'critical' | 'warning' | 'normal' {
  const days = getDaysUntilDeadline(task);
  
  if (days === null || task.status === 'concluido') return 'normal';
  if (days < 0) return 'overdue';
  if (days === 0) return 'critical'; // Today
  if (days <= 3) return 'warning';
  return 'normal';
}
