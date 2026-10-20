import { useState, useEffect, useCallback } from 'react';
import type { ProjectTask } from '@/types/projects';
import { getAllProjectTasksWithProject } from '@/lib/projectsApi';

export type ProjectTaskWithProject = ProjectTask & { project_nome: string };

export function useAllProjectTasks() {
  const [projectTasks, setProjectTasks] = useState<ProjectTaskWithProject[]>([]);

  const fetch = useCallback(async () => {
    const data = await getAllProjectTasksWithProject();
    setProjectTasks(data);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { projectTasks, refetch: fetch };
}
