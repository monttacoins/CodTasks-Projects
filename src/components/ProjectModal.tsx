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
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Project, ProjectFormData, ProjectStatus } from '@/types/projects';
import { PROJECT_STATUS_LABELS } from '@/types/projects';

interface ProjectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project | null;
  onSave: (data: ProjectFormData) => void;
}

export function ProjectModal({ open, onOpenChange, project, onSave }: ProjectModalProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('a_iniciar');
  const [progresso, setProgresso] = useState(0);

  useEffect(() => {
    if (project) {
      setNome(project.nome);
      setDescricao(project.descricao || '');
      setStatus(project.status);
      setProgresso(project.progresso);
    } else {
      setNome('');
      setDescricao('');
      setStatus('a_iniciar');
      setProgresso(0);
    }
  }, [project, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) return;
    onSave({ nome: nome.trim(), descricao: descricao.trim() || undefined, status, progresso });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? 'Editar Projeto' : 'Novo Projeto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proj-nome">Nome</Label>
            <Input
              id="proj-nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Nome do projeto"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="proj-desc">Descrição</Label>
            <Textarea
              id="proj-desc"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descrição opcional"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(PROJECT_STATUS_LABELS) as [ProjectStatus, string][]).map(
                  ([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Progresso: {progresso}%</Label>
            <Slider
              value={[progresso]}
              onValueChange={(v) => setProgresso(v[0])}
              max={100}
              step={5}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!nome.trim()}>
              {project ? 'Salvar' : 'Criar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
