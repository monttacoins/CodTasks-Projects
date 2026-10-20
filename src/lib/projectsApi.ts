import { supabase } from './supabase';
import type { Project, ProjectFormData, ProjectTask, ProjectTaskFormData, BloqueioTipo } from '@/types/projects';
import { fireProjectStatusWebhook } from './projectStatusWebhook';
import { normalizeDateFields } from './dateUtils';

const PROJECT_TASK_DATE_FIELDS = ['data_inicio', 'data_fim', 'data_conclusao'] as const;

// ===============================
// Projects
// ===============================

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('ordem', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao buscar projetos:', error);
    return [];
  }
  return (data || []) as Project[];
}

export async function createProject(formData: ProjectFormData): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .insert([{
      nome: formData.nome,
      descricao: formData.descricao,
      status: formData.status,
      progresso: formData.progresso,
    }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar projeto:', error);
    return null;
  }
  fireProjectStatusWebhook('project', 'CREATE', data);
  return data as Project;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar projeto:', error);
    return null;
  }
  fireProjectStatusWebhook('project', 'UPDATE', data);
  return data as Project;
}

export async function deleteProject(id: string): Promise<boolean> {
  const { data: existing } = await supabase.from('projects').select('*').eq('id', id).single();
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir projeto:', error);
    return false;
  }
  fireProjectStatusWebhook('project', 'DELETE', existing ?? { id });
  return true;
}

export async function setProjectBlocking(
  id: string,
  bloqueio_tipo: BloqueioTipo,
  bloqueio_motivo: string | null,
  bloqueio_tarefa_id: string | null
): Promise<Project | null> {
  return updateProject(id, {
    status: 'bloqueado',
    bloqueio_tipo,
    bloqueio_motivo,
    bloqueio_tarefa_id,
  });
}

export async function clearProjectBlocking(id: string): Promise<Project | null> {
  return updateProject(id, {
    bloqueio_tipo: null,
    bloqueio_motivo: null,
    bloqueio_tarefa_id: null,
  });
}

// ===============================
// Project Tasks
// ===============================

export async function getProjectTasks(projectId: string): Promise<ProjectTask[]> {
  const { data, error } = await supabase
    .from('project_tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('ordem', { ascending: true });

  if (error) {
    console.error('Erro ao buscar tarefas do projeto:', error);
    return [];
  }
  return (data || []) as ProjectTask[];
}

export async function createProjectTask(taskData: ProjectTaskFormData): Promise<ProjectTask | null> {
  const payload = normalizeDateFields(taskData as unknown as Record<string, unknown>, PROJECT_TASK_DATE_FIELDS as unknown as readonly string[]);
  const { data, error } = await supabase
    .from('project_tasks')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar tarefa do projeto:', error);
    return null;
  }
  fireProjectStatusWebhook('project_task', 'CREATE', data);
  return data as ProjectTask;
}

export async function updateProjectTask(id: string, updates: Partial<ProjectTaskFormData>): Promise<ProjectTask | null> {
  const payload = normalizeDateFields(updates as unknown as Record<string, unknown>, PROJECT_TASK_DATE_FIELDS as unknown as readonly string[]);
  const { data, error } = await supabase
    .from('project_tasks')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Erro ao atualizar tarefa do projeto:', error);
    return null;
  }
  fireProjectStatusWebhook('project_task', 'UPDATE', data);
  return data as ProjectTask;
}

export async function deleteProjectTask(id: string): Promise<boolean> {
  const { data: existing } = await supabase.from('project_tasks').select('*').eq('id', id).single();
  const { error } = await supabase.from('project_tasks').delete().eq('id', id);
  if (error) {
    console.error('Erro ao excluir tarefa do projeto:', error);
    return false;
  }
  fireProjectStatusWebhook('project_task', 'DELETE', existing ?? { id });
  return true;
}

export async function reorderProjectTasks(orderedIds: string[]): Promise<boolean> {
  const updates = orderedIds.map((id, index) =>
    supabase.from('project_tasks').update({ ordem: index }).eq('id', id)
  );
  const results = await Promise.all(updates);
  const hasError = results.some((r) => r.error);
  if (hasError) {
    console.error('Erro ao reordenar tarefas do projeto');
    return false;
  }
  fireProjectStatusWebhook('project_task', 'UPDATE', null, { reorder: orderedIds });
  return true;
}

export async function getAllProjectTasksWithProject(): Promise<(ProjectTask & { project_nome: string })[]> {
  const { data: projects } = await supabase.from('projects').select('id, nome');
  const { data: tasks, error } = await supabase.from('project_tasks').select('*').order('ordem', { ascending: true });

  if (error || !tasks) {
    console.error('Erro ao buscar todas as tarefas de projetos:', error);
    return [];
  }

  const projectMap = new Map((projects || []).map(p => [p.id, p.nome]));
  return (tasks as ProjectTask[]).map(t => ({
    ...t,
    project_nome: projectMap.get(t.project_id) || 'Projeto',
  }));
}

export async function reorderProjects(orderedIds: string[]): Promise<boolean> {
  const updates = orderedIds.map((id, index) =>
    supabase.from('projects').update({ ordem: index }).eq('id', id)
  );
  const results = await Promise.all(updates);
  const hasError = results.some((r) => r.error);
  if (hasError) {
    console.error('Erro ao reordenar projetos');
    return false;
  }
  fireProjectStatusWebhook('project', 'UPDATE', null, { reorder: orderedIds });
  return true;
}
