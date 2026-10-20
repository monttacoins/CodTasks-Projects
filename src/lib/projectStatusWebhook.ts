// Webhook disparado em qualquer alteração de projetos, tarefas de projetos
// ou tarefas de áreas. Envia o payload completo em JSON, enriquecido com
// dados do colaborador responsável (nome e whatsapps) quando aplicável.

import { supabase } from './supabase';

const PROJECT_STATUS_WEBHOOK_URL =
  'https://n8n-n8n-start.yh11mi.easypanel.host/webhook/projeto_status';

export type ProjectStatusEntity = 'project' | 'project_task' | 'area_task';
export type ProjectStatusAction = 'CREATE' | 'UPDATE' | 'DELETE';

async function enrichWithCollaborator(
  data: Record<string, unknown> | null
): Promise<Record<string, unknown> | null> {
  if (!data) return data;
  const collaboratorId = (data as Record<string, unknown>).collaborator_id;
  if (collaboratorId === undefined || collaboratorId === null || collaboratorId === '') {
    return {
      ...data,
      collaborator_name: null,
      whatsapp1: null,
      whatsapp2: null,
    };
  }

  try {
    const { data: collab, error } = await supabase
      .from('collaborators')
      .select('name, whatsapp1, whatsapp2')
      .eq('id', collaboratorId as never)
      .maybeSingle();

    if (error) {
      console.error('[PROJECT_STATUS_WEBHOOK] Erro ao buscar colaborador:', error);
      return { ...data, collaborator_name: null, whatsapp1: null, whatsapp2: null };
    }

    return {
      ...data,
      collaborator_name: collab?.name ?? null,
      whatsapp1: collab?.whatsapp1 ?? null,
      whatsapp2: collab?.whatsapp2 ?? null,
    };
  } catch (err) {
    console.error('[PROJECT_STATUS_WEBHOOK] Falha ao enriquecer colaborador:', err);
    return { ...data, collaborator_name: null, whatsapp1: null, whatsapp2: null };
  }
}

async function enrichWithProjectName(
  data: Record<string, unknown> | null
): Promise<Record<string, unknown> | null> {
  if (!data) return data;
  const projectId = (data as Record<string, unknown>).project_id;
  if (projectId === undefined || projectId === null || projectId === '') {
    return { ...data, project_name: null };
  }
  try {
    const { data: proj, error } = await supabase
      .from('projects')
      .select('nome')
      .eq('id', projectId as never)
      .maybeSingle();
    if (error) {
      console.error('[PROJECT_STATUS_WEBHOOK] Erro ao buscar projeto:', error);
      return { ...data, project_name: null };
    }
    return { ...data, project_name: proj?.nome ?? null };
  } catch (err) {
    console.error('[PROJECT_STATUS_WEBHOOK] Falha ao enriquecer projeto:', err);
    return { ...data, project_name: null };
  }
}

async function enrichWithAreaName(
  data: Record<string, unknown> | null
): Promise<Record<string, unknown> | null> {
  if (!data) return data;
  const areaId = (data as Record<string, unknown>).area_id;
  if (areaId === undefined || areaId === null || areaId === '') {
    return { ...data, area_name: null };
  }
  try {
    const { data: area, error } = await supabase
      .from('areas')
      .select('nome')
      .eq('id', areaId as never)
      .maybeSingle();
    if (error) {
      console.error('[PROJECT_STATUS_WEBHOOK] Erro ao buscar área:', error);
      return { ...data, area_name: null };
    }
    return { ...data, area_name: area?.nome ?? null };
  } catch (err) {
    console.error('[PROJECT_STATUS_WEBHOOK] Falha ao enriquecer área:', err);
    return { ...data, area_name: null };
  }
}

function normalizeDataFim(
  data: Record<string, unknown> | null
): Record<string, unknown> | null {
  if (!data) return data;
  const d = data as Record<string, unknown>;
  // Padronizado: ambas as tabelas (project_tasks e tasks) usam `data_fim`.
  // Mantemos fallback para `data` por compatibilidade com payloads antigos.
  const deadline =
    (d.data_fim !== undefined && d.data_fim !== null && d.data_fim !== ''
      ? d.data_fim
      : null) ??
    (d.data !== undefined && d.data !== null && d.data !== '' ? d.data : null);

  return {
    ...d,
    data_fim: deadline ?? null,
    data_final: deadline ?? null,
    deadline: deadline ?? null,
  };
}

export async function fireProjectStatusWebhook(
  entity: ProjectStatusEntity,
  action: ProjectStatusAction,
  data: Record<string, unknown> | null,
  extra?: Record<string, unknown>
): Promise<void> {
  let enrichedData = data;
  if (entity === 'project_task' || entity === 'area_task') {
    enrichedData = await enrichWithCollaborator(enrichedData);
    enrichedData = await enrichWithProjectName(enrichedData);
    enrichedData = await enrichWithAreaName(enrichedData);
    enrichedData = normalizeDataFim(enrichedData);
  } else if (entity === 'project') {
    enrichedData = enrichedData
      ? { ...enrichedData, project_name: (enrichedData as Record<string, unknown>).nome ?? null }
      : enrichedData;
  }

  const payload = {
    entity,
    action,
    timestamp: new Date().toISOString(),
    data: enrichedData,
    ...(extra || {}),
  };

  try {
    const response = await fetch(PROJECT_STATUS_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      console.error(
        `[PROJECT_STATUS_WEBHOOK] Erro ao chamar webhook. Status: ${response.status}`
      );
    }
  } catch (error) {
    console.error('[PROJECT_STATUS_WEBHOOK] Erro na requisição:', error);
  }
}
