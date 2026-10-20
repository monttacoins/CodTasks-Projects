import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, TaskFormData, Collaborator, TaskStatus, TaskPriority, Area } from '@/types';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types';
import type { Project } from '@/types/projects';
import { toast } from 'sonner';

interface TaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  areaId: string;
  areas: Area[];
  collaborators: Collaborator[];
  projects: Project[];
  onSave: (data: TaskFormData) => Promise<void>;
  prefilledDate?: string | null;
}

export function TaskModal({ open, onOpenChange, task, areaId, areas, collaborators, projects, onSave, prefilledDate }: TaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TaskFormData>({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data: '',
    status: 'a_iniciar',
    prioridade: 'Normal',
    area_id: areaId,
    collaborator_id: null,
    project_id: null
  });

  useEffect(() => {
    if (task) {
      setFormData({
        titulo: task.titulo,
        descricao: task.descricao || '',
        data_inicio: task.data_inicio ? task.data_inicio.substring(0, 10) : '',
        data: task.data ? task.data.substring(0, 10) : '',
        status: task.status,
        prioridade: task.prioridade || 'Normal',
        area_id: task.area_id,
        collaborator_id: task.collaborator_id || null,
        project_id: task.project_id || null
      });
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        data_inicio: '',
        data: prefilledDate || '',
        status: 'a_iniciar',
        prioridade: 'Normal',
        area_id: areaId,
        collaborator_id: null,
        project_id: null
      });
    }
  }, [task, areaId, open, prefilledDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.titulo.trim()) {
      toast.error('O título da tarefa é obrigatório!');
      return;
    }

    if (!formData.collaborator_id) {
      toast.error('O responsável é obrigatório!');
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      toast.success(task ? 'Tarefa atualizada!' : 'Tarefa criada!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Erro ao salvar tarefa');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof TaskFormData>(key: K, value: TaskFormData[K]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Editar Tarefa' : 'Nova Tarefa'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título *</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => updateField('titulo', e.target.value)}
              placeholder="Digite o título da tarefa"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              value={formData.descricao}
              onChange={(e) => updateField('descricao', e.target.value)}
              placeholder="Descrição da tarefa (opcional)"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="data_inicio">Data Inicial</Label>
              <Input
                id="data_inicio"
                type="date"
                value={formData.data_inicio}
                onChange={(e) => updateField('data_inicio', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="data">Data Final</Label>
              <Input
                id="data"
                type="date"
                value={formData.data}
                onChange={(e) => updateField('data', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="collaborator">Responsável *</Label>
            <Select
              value={formData.collaborator_id ? String(formData.collaborator_id) : ""}
              onValueChange={(value) => updateField('collaborator_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar responsável">
                  {formData.collaborator_id
                    ? (collaborators.find(c => String(c.id) === String(formData.collaborator_id))?.name || "Responsável selecionado")
                    : "Selecionar responsável"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {collaborators.map((collab) => (
                  <SelectItem key={String(collab.id)} value={String(collab.id)}>
                    {collab.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="area">Área</Label>
            <Select
              value={formData.area_id}
              onValueChange={(value) => updateField('area_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar área" />
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project">Projeto</Label>
            <Select
              value={formData.project_id || "none"}
              onValueChange={(value) => updateField('project_id', value === "none" ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Nenhum projeto">
                  {formData.project_id
                    ? (projects.find(p => p.id === formData.project_id)?.nome || "Projeto selecionado")
                    : "Nenhum projeto"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum projeto</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => updateField('status', value as TaskStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prioridade">Prioridade</Label>
              <Select
                value={formData.prioridade}
                onValueChange={(value) => updateField('prioridade', value as TaskPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
