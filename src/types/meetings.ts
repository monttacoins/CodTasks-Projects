export interface Meeting {
  id: string;
  data_reuniao: string;
  resumo?: string;
  created_at?: string;
  updated_at?: string;
  resolutions?: MeetingResolution[];
}

export interface MeetingResolution {
  id: string;
  meeting_id: string;
  texto: string;
  concluido: boolean;
  ordem: number;
  observacoes?: string;
  created_at?: string;
}

export interface MeetingFormData {
  data_reuniao: string;
  resolutions: ResolutionFormData[];
}

export interface ResolutionFormData {
  id?: string;
  texto: string;
  concluido: boolean;
}
