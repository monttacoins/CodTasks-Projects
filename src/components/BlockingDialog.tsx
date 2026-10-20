import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { BloqueioTipo, ProjectTask } from '@/types/projects';
import { BLOQUEIO_TIPO_LABELS } from '@/types/projects';

interface BlockingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectTasks: ProjectTask[];
  onConfirm: (tipo: BloqueioTipo, motivo: string | null, tarefaId: string | null) => void;
}

export function BlockingDialog({ open, onOpenChange, projectTasks, onConfirm }: BlockingDialogProps) {
  const [tipo, setTipo] = useState<BloqueioTipo | ''>('');
  const [motivo, setMotivo] = useState('');
  const [tarefaId, setTarefaId] = useState('');

  const handleConfirm = () => {
    if (!tipo) return;
    if (tipo === 'tarefa') {
      onConfirm(tipo, null, tarefaId || null);
    } else {
      onConfirm(tipo, motivo.trim() || null, null);
    }
    // reset
    setTipo('');
    setMotivo('');
    setTarefaId('');
    onOpenChange(false);
  };

  const handleCancel = () => {
    setTipo('');
    setMotivo('');
    setTarefaId('');
    onOpenChange(false);
  };

  const pendingTasks = projectTasks.filter(t => t.status !== 'concluido');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Motivo do Bloqueio</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-3">
            <Label>Tipo de Dependência</Label>
            <RadioGroup value={tipo} onValueChange={(v) => setTipo(v as BloqueioTipo)}>
              {(Object.entries(BLOQUEIO_TIPO_LABELS) as [BloqueioTipo, string][]).map(([value, label]) => (
                <div key={value} className="flex items-center space-x-2">
                  <RadioGroupItem value={value} id={`bloqueio-${value}`} />
                  <Label htmlFor={`bloqueio-${value}`} className="font-normal cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {(tipo === 'cliente' || tipo === 'membro' || tipo === 'outros') && (
            <div className="space-y-2">
              <Label>Motivo do Bloqueio</Label>
              <Textarea
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                placeholder="Descreva o motivo do bloqueio..."
                rows={3}
              />
            </div>
          )}

          {tipo === 'tarefa' && (
            <div className="space-y-2">
              <Label>Tarefa pendente</Label>
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma tarefa pendente no projeto.</p>
              ) : (
                <Select value={tarefaId} onValueChange={setTarefaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a tarefa" />
                  </SelectTrigger>
                  <SelectContent>
                    {pendingTasks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!tipo || (tipo === 'tarefa' && !tarefaId && pendingTasks.length > 0)}
            variant="destructive"
          >
            Confirmar Bloqueio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
