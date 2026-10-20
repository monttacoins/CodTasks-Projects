import { supabase } from './supabase';
import type { Area, Task, Collaborator, TaskFormData } from '@/types';
import { fireProjectStatusWebhook } from './projectStatusWebhook';
import { normalizeDateFields } from './dateUtils';

const TASK_DATE_FIELDS = ['data', 'data_inicio', 'data_fim', 'data_conclusao'] as const;

const WEBHOOK_URL = "https://n8n-n8n-start.yh11mi.easypanel.host/webhook/agenda_interna";

// ===============================
// Webhook
// ===============================

export async function callWebhook(payload: Record<string, unknown>) {
  console.log("Chamando Webhook com payload:", payload);
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[WEBHOOK ERROR] Erro ao chamar o webhook. Status: ${response.status}`);
    } else {
      console.log("Webhook chamado com sucesso!");
    }
  } catch (error) {
    console.error("[WEBHOOK ERROR] Erro na requisição do webhook:", error);
  }
}

// ===============================
// Areas
// ===============================

export async function getAreas(): Promise<Area[]> {
  const { data, error } = await supabase
    .from("areas")
    .select("*")
    .order("nome", { ascending: true });
  
  if (error) {
    console.error("Erro ao buscar áreas:", error);
    return [];
  }
  return data || [];
}

export async function addArea(nome: string): Promise<void> {
  const { error } = await supabase.from("areas").insert([{ nome }]);
  if (error) console.error("Erro ao adicionar área:", error);
}

export async function deleteArea(id: string): Promise<void> {
  const { error } = await supabase.from("areas").delete().eq("id", id);
  if (error) console.error("Erro ao excluir área:", error);
}

export async function updateArea(id: string, nome: string): Promise<void> {
  const { error } = await supabase.from("areas").update({ nome }).eq("id", id);
  if (error) console.error("Erro ao atualizar área:", error);
}

// ===============================
// Collaborators
// ===============================

export async function getCollaborators(): Promise<Collaborator[]> {
  const { data, error } = await supabase
    .from("collaborators")
    .select("*")
    .order("name", { ascending: true });
  
  if (error) {
    console.error("Erro ao buscar colaboradores:", error);
    return [];
  }
  return data || [];
}

// ===============================
// Tasks
// ===============================

import { PRIORITY_ORDER, TaskPriority } from '@/types';

const sortTasksByPriority = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    const priorityA = PRIORITY_ORDER[a.prioridade as TaskPriority] ?? 2;
    const priorityB = PRIORITY_ORDER[b.prioridade as TaskPriority] ?? 2;
    if (priorityA !== priorityB) return priorityA - priorityB;
    // Secondary sort by date
    const dateA = a.data ? new Date(a.data).getTime() : Infinity;
    const dateB = b.data ? new Date(b.data).getTime() : Infinity;
    return dateA - dateB;
  });
};

export async function getTasksByArea(area_id: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from("tasks")
    .select("*, collaborators(name)")
    .eq("area_id", area_id);
    
  if (error) {
    console.error("Erro ao buscar tarefas por área:", error);
    return [];
  }
  return sortTasksByPriority(data || []);
}

export async function getAllTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, areas(nome), collaborators(name)');

  if (error) {
    console.error("Erro ao buscar todas as tarefas:", error);
    return [];
  }
  return sortTasksByPriority(data || []);
}

export async function addTask(task: TaskFormData): Promise<Task | null> {
  const payload = normalizeDateFields(task as unknown as Record<string, unknown>, TASK_DATE_FIELDS as unknown as readonly string[]);
  const { data, error } = await supabase
    .from("tasks")
    .insert([payload])
    .select();

  if (error) {
    console.error("Erro do Supabase ao adicionar tarefa:", error.message);
    return null;
  }
  const created = data?.[0] || null;
  if (created) fireProjectStatusWebhook('area_task', 'CREATE', created);
  return created;
}

export async function deleteTask(id: string): Promise<boolean> {
  const { data: existing } = await supabase.from("tasks").select("*").eq("id", id).single();
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) {
    console.error("Erro ao excluir tarefa:", error);
    return false;
  }
  fireProjectStatusWebhook('area_task', 'DELETE', existing ?? { id });
  return true;
}

export async function updateTask(id: string, taskData: Partial<TaskFormData>): Promise<Task | null> {
  const payload = normalizeDateFields(taskData as unknown as Record<string, unknown>, TASK_DATE_FIELDS as unknown as readonly string[]);
  const { data, error } = await supabase
    .from("tasks")
    .update(payload)
    .eq("id", id)
    .select();
    
  if (error) {
    console.error("Erro do Supabase ao atualizar tarefa:", error.message);
    return null;
  }
  const updated = data?.[0] || null;
  if (updated) fireProjectStatusWebhook('area_task', 'UPDATE', updated);
  return updated;
}

export async function getCompletedAreaId(): Promise<string | null> {
  const areas = await getAreas();
  const completedArea = areas.find(a => a.nome === 'Z - Concluídos');
  return completedArea?.id || null;
}

export async function updateTaskStatus(id: string, status: Task['status']): Promise<{ success: boolean; newAreaId?: string }> {
  // If status is "concluido", also move to "Z - Concluídos" area and set completion date
  if (status === 'concluido') {
    const completedAreaId = await getCompletedAreaId();
    const updateData: Partial<TaskFormData> = { 
      status, 
      data_conclusao: new Date().toISOString() 
    };
    if (completedAreaId) {
      updateData.area_id = completedAreaId;
    }
    const result = await updateTask(id, updateData);
    return { success: result !== null, newAreaId: completedAreaId || undefined };
  }
  
  // If status is changed FROM concluido, clear the completion date
  const result = await updateTask(id, { status, data_conclusao: undefined });
  return { success: result !== null };
}
