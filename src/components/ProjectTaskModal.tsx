import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ProjectTask, ProjectTaskFormData } from '@/types/projects';
import { STATUS_LABELS, PRIORITY_LABELS } from '@/types';
import type { TaskStatus, TaskPriority, Collaborator } from '@/types';
import { toast } from 'sonner';

interface ProjectTaskModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: ProjectTask | null;
  projectId: string;
  collaborators: Collaborator[];
  onSave: (data: ProjectTaskFormData) => Promise<unknown>;
}

export function ProjectTaskModal({ open, onOpenChange, task, projectId, collaborators, onSave }: ProjectTaskModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ProjectTaskFormData>({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    status: 'a_iniciar',
    prioridade: 'Normal',
    project_id: projectId,
    collaborator_id: null,
    observacoes: '',
  });

  useEffect(() => {
    if (task) {
      setFormData({
        titulo: task.titulo,
        descricao: task.descricao || '',
        data_inicio: task.data_inicio ? task.data_inicio.substring(0, 10) : '',
        data_fim: task.data_fim ? task.data_fim.substring(0, 10) : '',
        status: task.status,
        prioridade: task.prioridade,
        project_id: task.project_id,
        collaborator_id: task.collaborator_id || null,
        observacoes: task.observacoes || '',
      });
    } else {
      setFormData({
        titulo: '',
        descricao: '',
        data_inicio: '',
        data_fim: '',
        status: 'a_iniciar',
        prioridade: 'Normal',
        project_id: projectId,
        collaborator_id: null,
        observacoes: '',
      });
    }
  }, [task, projectId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titulo.trim()) {
      toast.error('O título é obrigatório!');
      return;
    }
    setLoading(true);
    try {
      await onSave(formData);
      toast.success(task ? 'Tarefa atualizada!' : 'Tarefa criada!');
      onOpenChange(false);
    } catch {
      toast.error('Erro ao salvar tarefa');
    } finally {
      setLoading(false);
    }
  };

  const updateField = <K extends keyof ProjectTaskFormData>(key: K, value: ProjectTaskFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{task ? 'Editar Tarefa' : 'Nova Tarefa do Projeto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="pt-titulo">Título *</Label>
            <Input
              id="pt-titulo"
              value={formData.titulo}
              onChange={(e) => updateField('titulo', e.target.value)}
              placeholder="Título da tarefa"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pt-desc">Descrição</Label>
            <Textarea
              id="pt-desc"
              value={formData.descricao}
              onChange={(e) => updateField('descricao', e.target.value)}
              placeholder="Descrição (opcional)"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={formData.data_inicio}
                onChange={(e) => updateField('data_inicio', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={formData.data_fim}
                onChange={(e) => updateField('data_fim', e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v) => updateField('status', v as TaskStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(STATUS_LABELS) as [TaskStatus, string][]).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Prioridade</Label>
              <Select value={formData.prioridade} onValueChange={(v) => updateField('prioridade', v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.entries(PRIORITY_LABELS) as [TaskPriority, string][]).map(([val, label]) => (
                    <SelectItem key={val} value={val}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Responsável</Label>
            <Select
              value={formData.collaborator_id ? String(formData.collaborator_id) : "none"}
              onValueChange={(value) => updateField('collaborator_id', value === 'none' ? null : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecionar responsável" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem responsável</SelectItem>
                {collaborators.map((collab) => (
                  <SelectItem key={String(collab.id)} value={String(collab.id)}>
                    {collab.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pt-obs">Observações</Label>
            <Textarea
              id="pt-obs"
              value={formData.observacoes || ''}
              onChange={(e) => updateField('observacoes', e.target.value)}
              placeholder="Observações (opcional)"
              rows={3}
            />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
