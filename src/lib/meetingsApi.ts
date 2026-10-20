import { supabase } from '@/integrations/supabase/client';
import type { Meeting, MeetingResolution } from '@/types/meetings';
import { toBrtTimestamptz } from './dateUtils';

// ===============================
// Meetings
// ===============================

export async function getMeetings(): Promise<Meeting[]> {
  const { data, error } = await supabase
    .from('meetings')
    .select('*, meeting_resolutions(*)')
    .order('data_reuniao', { ascending: false });

  if (error) {
    console.error('Erro ao buscar reuniões:', error);
    return [];
  }

  return (data || []).map((m: any) => ({
    ...m,
    resolutions: (m.meeting_resolutions || []).sort(
      (a: MeetingResolution, b: MeetingResolution) => a.ordem - b.ordem
    ),
  }));
}

export async function addMeeting(data_reuniao: string): Promise<Meeting | null> {
  const { data, error } = await supabase
    .from('meetings')
    .insert([{ data_reuniao: toBrtTimestamptz(data_reuniao) }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao criar reunião:', error);
    return null;
  }
  return { ...data, resolutions: [] };
}

export async function updateMeeting(id: string, updates: { data_reuniao?: string; resumo?: string }): Promise<boolean> {
  const payload: { data_reuniao?: string; resumo?: string } = { ...updates };
  if (updates.data_reuniao !== undefined) {
    payload.data_reuniao = toBrtTimestamptz(updates.data_reuniao) ?? undefined;
  }
  const { error } = await supabase
    .from('meetings')
    .update(payload)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar reunião:', error);
    return false;
  }
  return true;
}

export async function deleteMeeting(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir reunião:', error);
    return false;
  }
  return true;
}

// ===============================
// Resolutions
// ===============================

export async function addResolution(meeting_id: string, texto: string, ordem: number): Promise<MeetingResolution | null> {
  const { data, error } = await supabase
    .from('meeting_resolutions')
    .insert([{ meeting_id, texto, ordem }])
    .select()
    .single();

  if (error) {
    console.error('Erro ao adicionar resolução:', error);
    return null;
  }
  return data;
}

export async function updateResolution(id: string, updates: Partial<Pick<MeetingResolution, 'texto' | 'concluido' | 'ordem' | 'observacoes'>>): Promise<boolean> {
  const { error } = await supabase
    .from('meeting_resolutions')
    .update(updates)
    .eq('id', id);

  if (error) {
    console.error('Erro ao atualizar resolução:', error);
    return false;
  }
  return true;
}

export async function deleteResolution(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('meeting_resolutions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Erro ao excluir resolução:', error);
    return false;
  }
  return true;
}
