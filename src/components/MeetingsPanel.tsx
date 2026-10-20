import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, CalendarIcon, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MeetingCard } from '@/components/MeetingCard';
import { useMeetings } from '@/hooks/useMeetings';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function MeetingsPanel() {
  const {
    meetings,
    loading,
    createMeeting,
    editMeeting,
    removeMeeting,
    createResolution,
    editResolution,
    removeResolution,
  } = useMeetings();

  const [newMeetingDate, setNewMeetingDate] = useState<Date | undefined>();
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreateMeeting = async () => {
    if (!newMeetingDate) return;
    const dateStr = format(newMeetingDate, 'yyyy-MM-dd');
    const result = await createMeeting(dateStr);
    if (result) {
      toast.success('Reunião criada!');
      setNewMeetingDate(undefined);
      setDatePickerOpen(false);
    } else {
      toast.error('Erro ao criar reunião.');
    }
  };

  const handleDeleteMeeting = async () => {
    if (!deleteConfirm) return;
    const success = await removeMeeting(deleteConfirm);
    if (success) {
      toast.success('Reunião excluída!');
    }
    setDeleteConfirm(null);
  };

  const handleUpdateDate = async (id: string, date: string) => {
    const success = await editMeeting(id, { data_reuniao: date });
    if (success) toast.success('Data atualizada!');
    return success;
  };

  const handleUpdateResumo = async (id: string, resumo: string) => {
    const success = await editMeeting(id, { resumo });
    if (success) toast.success('Resumo atualizado!');
    return success;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 text-muted-foreground">
        Carregando reuniões...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with create */}
      <div className="flex items-center gap-3 flex-wrap">
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className={cn("gap-2", !newMeetingDate && "text-muted-foreground")}>
              <CalendarIcon className="h-4 w-4" />
              {newMeetingDate
                ? format(newMeetingDate, "dd/MM/yyyy", { locale: ptBR })
                : "Selecione a data"
              }
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={newMeetingDate}
              onSelect={setNewMeetingDate}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <Button onClick={handleCreateMeeting} disabled={!newMeetingDate} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Nova Reunião
        </Button>
      </div>

      {/* Meetings List */}
      {meetings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Users className="h-12 w-12 mb-3 opacity-40" />
          <p className="text-sm">Nenhuma reunião registrada.</p>
          <p className="text-xs mt-1">Selecione uma data e clique em "Nova Reunião".</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {meetings.map((meeting) => (
            <MeetingCard
              key={meeting.id}
              meeting={meeting}
              onUpdateDate={handleUpdateDate}
              onUpdateResumo={handleUpdateResumo}
              onDelete={(id) => setDeleteConfirm(id)}
              onAddResolution={createResolution}
              onUpdateResolution={editResolution}
              onDeleteResolution={removeResolution}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta reunião? Todas as resoluções associadas serão perdidas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteMeeting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
