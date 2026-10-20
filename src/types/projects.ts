export type ProjectStatus = 'a_iniciar' | 'em_andamento' | 'bloqueado' | 'concluido';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  a_iniciar: 'A Iniciar',
  em_andamento: 'Em Andamento',
  bloqueado: 'Bloqueado',
  concluido: 'Concluído',
};

export const PROJECT_STATUS_COLORS: Record<ProjectStatus, string> = {
  a_iniciar: 'bg-muted text-muted-foreground',
  em_andamento: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  bloqueado: 'bg-destructive/20 text-destructive border border-destructive/30',
  concluido: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
};

export type BloqueioTipo = 'cliente' | 'membro' | 'tarefa' | 'outros';

export const BLOQUEIO_TIPO_LABELS: Record<BloqueioTipo, string> = {
  cliente: 'Cliente',
  membro: 'Membro',
  tarefa: 'Tarefa',
  outros: 'Outros',
};

export interface Project {
  id: string;
  nome: string;
  descricao?: string;
  status: ProjectStatus;
  progresso: number;
  bloqueio_tipo?: BloqueioTipo | null;
  bloqueio_motivo?: string | null;
  bloqueio_tarefa_id?: string | null;
  created_at: string;
}

export interface ProjectFormData {
  nome: string;
  descricao?: string;
  status: ProjectStatus;
  progresso: number;
}

export interface ProjectTask {
  id: string;
  project_id: string;
  titulo: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  data_conclusao?: string;
  status: 'a_iniciar' | 'pendente' | 'andamento' | 'concluido';
  prioridade: 'Crítico' | 'Alta' | 'Normal' | 'Baixa';
  collaborator_id?: string | null;
  observacoes?: string | null;
  ordem: number;
  created_at?: string;
}

export interface ProjectTaskFormData {
  titulo: string;
  descricao?: string;
  data_inicio?: string;
  data_fim?: string;
  data_conclusao?: string;
  status: 'a_iniciar' | 'pendente' | 'andamento' | 'concluido';
  prioridade: 'Crítico' | 'Alta' | 'Normal' | 'Baixa';
  project_id: string;
  collaborator_id?: string | null;
  observacoes?: string | null;
  ordem?: number;
}
