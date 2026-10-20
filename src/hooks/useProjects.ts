import { useState, useEffect, useCallback } from 'react';
import type { Project, ProjectFormData, BloqueioTipo } from '@/types/projects';
import * as api from '@/lib/projectsApi';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const data = await api.getProjects();
    setProjects(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (data: ProjectFormData) => {
    const p = await api.createProject(data);
    if (p) await fetchProjects();
    return p;
  }, [fetchProjects]);

  const updateProject = useCallback(async (id: string, data: Partial<Project>) => {
    const p = await api.updateProject(id, data);
    if (p) await fetchProjects();
    return p;
  }, [fetchProjects]);

  const deleteProject = useCallback(async (id: string) => {
    const ok = await api.deleteProject(id);
    if (ok) await fetchProjects();
    return ok;
  }, [fetchProjects]);

  const setBlocking = useCallback(async (
    id: string,
    tipo: BloqueioTipo,
    motivo: string | null,
    tarefaId: string | null
  ) => {
    const p = await api.setProjectBlocking(id, tipo, motivo, tarefaId);
    if (p) await fetchProjects();
    return p;
  }, [fetchProjects]);

  const clearBlocking = useCallback(async (id: string) => {
    const p = await api.clearProjectBlocking(id);
    if (p) await fetchProjects();
    return p;
  }, [fetchProjects]);

  const reorderProjects = useCallback(async (orderedIds: string[]) => {
    const reordered = orderedIds.map((id, index) => {
      const p = projects.find((pr) => pr.id === id)!;
      return { ...p, ordem: index };
    });
    setProjects(reordered);
    await api.reorderProjects(orderedIds);
  }, [projects]);

  return { projects, loading, createProject, updateProject, deleteProject, setBlocking, clearBlocking, reorderProjects, refetch: fetchProjects };
}
