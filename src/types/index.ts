export interface Area {
  id: string;
  nome: string;
  created_at?: string;
}

export interface Collaborator {
  id: string;
  name: string;
  created_at?: string;
}

export type TaskPriority = 'Crítico' | 'Alta' | 'Normal' | 'Baixa';

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  'Crítico': 'Crítico',
  'Alta': 'Alta',
  'Normal': 'Normal',
  'Baixa': 'Baixa'
};

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  'Crítico': 0,
  'Alta': 1,
  'Normal': 2,
  'Baixa': 3
};

export interface Task {
  id: string;
  titulo: string;
  descricao?: string;
  data_inicio?: string;
  data?: string;
  data_fim?: string;
  data_conclusao?: string;
  status: 'a_iniciar' | 'pendente' | 'andamento' | 'concluido';
  prioridade: TaskPriority;
  area_id: string;
  collaborator_id?: string;
  project_id?: string | null;
  created_at?: string;
  collaborators?: { name: string };
  areas?: { nome: string };
}

export interface TaskFormData {
  titulo: string;
  descricao?: string;
  data_inicio?: string;
  data?: string;
  data_conclusao?: string;
  status: 'a_iniciar' | 'pendente' | 'andamento' | 'concluido';
  prioridade: TaskPriority;
  area_id: string;
  collaborator_id?: string | null;
  project_id?: string | null;
}

export type TaskStatus = 'a_iniciar' | 'pendente' | 'andamento' | 'concluido';

export const STATUS_LABELS: Record<TaskStatus, string> = {
  a_iniciar: 'A iniciar',
  pendente: 'Pendente',
  andamento: 'Em andamento',
  concluido: 'Concluído'
};
