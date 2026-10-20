import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Plus, Trash2, Pencil, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Meeting, MeetingResolution } from '@/types/meetings';

interface MeetingCardProps {
  meeting: Meeting;
  onUpdateDate: (id: string, date: string) => Promise<boolean>;
  onUpdateResumo: (id: string, resumo: string) => Promise<boolean>;
  onDelete: (id: string) => void;
  onAddResolution: (meetingId: string, texto: string, ordem: number) => Promise<any>;
  onUpdateResolution: (id: string, updates: { texto?: string; concluido?: boolean; observacoes?: string }) => Promise<boolean>;
  onDeleteResolution: (id: string) => Promise<boolean>;
}

export function MeetingCard({
  meeting,
  onUpdateDate,
  onUpdateResumo,
  onDelete,
  onAddResolution,
  onUpdateResolution,
  onDeleteResolution,
}: MeetingCardProps) {
  const [isEditingDate, setIsEditingDate] = useState(false);
  const [newResolutionText, setNewResolutionText] = useState('');
  const [editingResolutionId, setEditingResolutionId] = useState<string | null>(null);
  const [editingResolutionText, setEditingResolutionText] = useState('');
  const [resumoText, setResumoText] = useState(meeting.resumo || '');
  const [resumoTimer, setResumoTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const resolutions = meeting.resolutions || [];

  const handleDateSelect = async (date: Date | undefined) => {
    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      await onUpdateDate(meeting.id, dateStr);
      setIsEditingDate(false);
    }
  };

  const handleAddResolution = async () => {
    const text = newResolutionText.trim();
    if (!text) return;
    await onAddResolution(meeting.id, text, resolutions.length);
    setNewResolutionText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddResolution();
    }
  };

  const handleStartEditResolution = (res: MeetingResolution) => {
    setEditingResolutionId(res.id);
    setEditingResolutionText(res.texto);
  };

  const handleSaveEditResolution = async () => {
    if (editingResolutionId && editingResolutionText.trim()) {
      await onUpdateResolution(editingResolutionId, { texto: editingResolutionText.trim() });
    }
    setEditingResolutionId(null);
    setEditingResolutionText('');
  };

  const handleCancelEditResolution = () => {
    setEditingResolutionId(null);
    setEditingResolutionText('');
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEditResolution();
    }
    if (e.key === 'Escape') {
      handleCancelEditResolution();
    }
  };

  const meetingDate = parseISO(meeting.data_reuniao);

  return (
    <Card className="border border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            {isEditingDate ? (
              <Popover open={true} onOpenChange={(open) => !open && setIsEditingDate(false)}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="text-sm">
                    {format(meetingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={meetingDate}
                    onSelect={handleDateSelect}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              <span
                className="font-semibold text-foreground cursor-pointer hover:underline"
                onClick={() => setIsEditingDate(true)}
                title="Clique para editar a data"
              >
                {format(meetingDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(meeting.id)}
            title="Excluir reunião"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Resoluções
        </div>

        {/* Resolution List */}
        <div className="space-y-4">
          {resolutions.map((res) => (
            <div key={res.id} className="space-y-1.5">
              <div
                className="flex items-start gap-2 group rounded-md p-1.5 -mx-1.5 hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  checked={res.concluido}
                  onCheckedChange={(checked) =>
                    onUpdateResolution(res.id, { concluido: checked === true })
                  }
                  className="mt-0.5"
                />

                {editingResolutionId === res.id ? (
                  <div className="flex-1 flex items-center gap-1">
                    <Input
                      value={editingResolutionText}
                      onChange={(e) => setEditingResolutionText(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      className="h-7 text-sm"
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleSaveEditResolution}>
                      <Check className="h-3.5 w-3.5 text-primary" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={handleCancelEditResolution}>
                      <X className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex-1 flex items-start justify-between gap-1">
                    <span
                      className={cn(
                        "text-sm leading-snug flex-1 cursor-pointer",
                        res.concluido && "line-through text-muted-foreground"
                      )}
                      onClick={() => handleStartEditResolution(res)}
                      title="Clique para editar"
                    >
                      {res.texto}
                    </span>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleStartEditResolution(res)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 hover:text-destructive"
                        onClick={() => onDeleteResolution(res.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Observações */}
              <div className="ml-7">
                <div className="text-xs font-medium text-muted-foreground mb-1">Observações</div>
                <Textarea
                  defaultValue={res.observacoes || ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const resId = res.id;
                    clearTimeout((window as any)[`obs_timer_${resId}`]);
                    (window as any)[`obs_timer_${resId}`] = setTimeout(() => {
                      onUpdateResolution(resId, { observacoes: value });
                    }, 1000);
                  }}
                  onBlur={(e) => {
                    const resId = res.id;
                    clearTimeout((window as any)[`obs_timer_${resId}`]);
                    onUpdateResolution(resId, { observacoes: e.target.value });
                  }}
                  placeholder="Adicionar observações..."
                  rows={3}
                  className="text-sm resize-y"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Add new resolution */}
        <div className="flex items-center gap-2 pt-1">
          <Input
            value={newResolutionText}
            onChange={(e) => setNewResolutionText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nova resolução..."
            className="h-8 text-sm"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={handleAddResolution}
            disabled={!newResolutionText.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Resumo */}
        <div className="pt-3 space-y-2">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Resumo da Reunião
          </div>
          <Textarea
            value={resumoText}
            onChange={(e) => {
              const value = e.target.value;
              setResumoText(value);
              if (resumoTimer) clearTimeout(resumoTimer);
              setResumoTimer(setTimeout(() => {
                onUpdateResumo(meeting.id, value);
              }, 1000));
            }}
            onBlur={() => {
              if (resumoTimer) clearTimeout(resumoTimer);
              onUpdateResumo(meeting.id, resumoText);
            }}
            placeholder="Escreva um resumo da reunião..."
            rows={10}
            className="text-sm resize-y"
          />
        </div>
      </CardContent>
    </Card>
  );
}
