import { useState, useEffect, useCallback } from 'react';
import type { ProjectTask, ProjectTaskFormData } from '@/types/projects';
import * as api from '@/lib/projectsApi';

export function useProjectTasks(projectId: string | null) {
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!projectId) { setTasks([]); return; }
    setLoading(true);
    const data = await api.getProjectTasks(projectId);
    setTasks(data);
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (data: ProjectTaskFormData) => {
    const nextOrdem = tasks.length;
    const t = await api.createProjectTask({ ...data, ordem: nextOrdem });
    if (t) await fetchTasks();
    return t;
  }, [fetchTasks, tasks.length]);

  const updateTask = useCallback(async (id: string, data: Partial<ProjectTaskFormData>) => {
    const t = await api.updateProjectTask(id, data);
    if (t) await fetchTasks();
    return t;
  }, [fetchTasks]);

  const deleteTask = useCallback(async (id: string) => {
    const ok = await api.deleteProjectTask(id);
    if (ok) await fetchTasks();
    return ok;
  }, [fetchTasks]);

  const reorderTasks = useCallback(async (orderedIds: string[]) => {
    // Optimistic update
    const reordered = orderedIds.map((id, i) => {
      const task = tasks.find(t => t.id === id)!;
      return { ...task, ordem: i };
    });
    setTasks(reordered);
    await api.reorderProjectTasks(orderedIds);
  }, [tasks]);

  return { tasks, loading, createTask, updateTask, deleteTask, reorderTasks, refetch: fetchTasks };
}
