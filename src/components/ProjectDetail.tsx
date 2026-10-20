import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, AlertTriangle, GripVertical, Link } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import type { Project, ProjectStatus, BloqueioTipo, ProjectTask, ProjectTaskFormData } from '@/types/projects';
import { PROJECT_STATUS_LABELS, PROJECT_STATUS_COLORS, BLOQUEIO_TIPO_LABELS } from '@/types/projects';
import { BlockingDialog } from '@/components/BlockingDialog';
import { ProjectTaskCard } from '@/components/ProjectTaskCard';
import { ProjectTaskModal } from '@/components/ProjectTaskModal';
import { ProjectTaskDetailModal } from '@/components/ProjectTaskDetailModal';
import { useProjectTasks } from '@/hooks/useProjectTasks';
import { useCollaborators } from '@/hooks/useCollaborators';
import { supabase } from '@/lib/supabase';
import type { Task } from '@/types';
import { toast } from 'sonner';

function SortableTaskWrapper({ task, collaboratorName, onEdit, onDelete, onClick, onStatusChange, onPriorityChange }: {
  task: ProjectTask;
  collaboratorName?: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onClick: () => void;
  onStatusChange: (s: string) => void;
  onPriorityChange: (p: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-start gap-2">
      <button
        {...attributes}
        {...listeners}
        className="mt-3 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground shrink-0"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex-1">
        <ProjectTaskCard
          task={task}
          collaboratorName={collaboratorName}
          onEdit={onEdit}
          onDelete={onDelete}
          onClick={onClick}
          onStatusChange={onStatusChange}
          onPriorityChange={onPriorityChange}
        />
      </div>
    </div>
  );
}

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdate: (id: string, data: Partial<Project>) => Promise<unknown>;
  onSetBlocking: (id: string, tipo: BloqueioTipo, motivo: string | null, tarefaId: string | null) => Promise<unknown>;
  onClearBlocking: (id: string) => Promise<unknown>;
}

export function ProjectDetail({ project, onBack, onUpdate, onSetBlocking, onClearBlocking }: ProjectDetailProps) {
  const { tasks, createTask, updateTask, deleteTask, reorderTasks } = useProjectTasks(project.id);
  const { collaborators } = useCollaborators();
  const [linkedTasks, setLinkedTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchLinkedTasks = async () => {
      const { data } = await supabase
        .from('tasks')
        .select('*, areas(nome), collaborators(name)')
        .eq('project_id', project.id);
      setLinkedTasks((data || []) as Task[]);
    };
    fetchLinkedTasks();
  }, [project.id, tasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex(t => t.id === active.id);
      const newIndex = tasks.findIndex(t => t.id === over.id);
      const newOrder = arrayMove(tasks, oldIndex, newIndex);
      reorderTasks(newOrder.map(t => t.id));
    }
  };
  const [blockingOpen, setBlockingOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<ProjectStatus | null>(null);
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<typeof tasks[0] | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<string | null>(null);
  const [detailTask, setDetailTask] = useState<ProjectTask | null>(null);

  const createdDate = new Date(project.created_at).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleStatusChange = (newStatus: ProjectStatus) => {
    if (newStatus === 'bloqueado') {
      setPendingStatus(newStatus);
      setBlockingOpen(true);
    } else {
      onUpdate(project.id, { status: newStatus });
      if (project.status === 'bloqueado') {
        onClearBlocking(project.id);
      }
    }
  };

  const handleBlockingConfirm = async (tipo: BloqueioTipo, motivo: string | null, tarefaId: string | null) => {
    await onSetBlocking(project.id, tipo, motivo, tarefaId);
    setPendingStatus(null);
  };

  const handleSaveTask = async (data: ProjectTaskFormData) => {
    if (editingTask) {
      await updateTask(editingTask.id, data);
    } else {
      await createTask(data);
    }
  };

  const confirmDeleteTask = async () => {
    if (deleteTaskId) {
      await deleteTask(deleteTaskId);
      toast.success('Tarefa excluída!');
      setDeleteTaskId(null);
    }
  };

  // Find blocking task title
  const blockingTaskTitle = project.bloqueio_tarefa_id
    ? tasks.find((t) => t.id === project.bloqueio_tarefa_id)?.titulo
    : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 -ml-2">
        <ArrowLeft className="h-4 w-4" />
        Voltar aos Projetos
      </Button>

      <div className="bg-card border border-border rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-bold text-foreground">{project.nome}</h2>

        {project.descricao && (
          <p className="text-sm text-muted-foreground">{project.descricao}</p>
        )}

        {/* Data de Criação */}
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Data de Criação</span>
          <p className="text-sm text-foreground mt-1">{createdDate}</p>
        </div>

        {/* Status */}
        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-2">Status</span>
          <div className="flex items-center gap-3">
            <span className={cn('px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide', PROJECT_STATUS_COLORS[project.status])}>
              {PROJECT_STATUS_LABELS[project.status]}
            </span>
            <Select value={project.status} onValueChange={(v) => handleStatusChange(v as ProjectStatus)}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <SelectValue placeholder="Alterar status" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(PROJECT_STATUS_LABELS) as [ProjectStatus, string][]).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Blocking info */}
          {project.status === 'bloqueado' && project.bloqueio_tipo && (
            <div className="mt-3 p-3 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
              <div className="text-sm">
                <span className="font-medium text-destructive">
                  Bloqueado por: {BLOQUEIO_TIPO_LABELS[project.bloqueio_tipo]}
                </span>
                {project.bloqueio_motivo && (
                  <p className="text-muted-foreground mt-1">{project.bloqueio_motivo}</p>
                )}
                {project.bloqueio_tipo === 'tarefa' && blockingTaskTitle && (
                  <p className="text-muted-foreground mt-1">Tarefa: {blockingTaskTitle}</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Progresso */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Progresso</span>
            <span className="text-sm font-bold text-foreground">{project.progresso}%</span>
          </div>
          <Progress value={project.progresso} className="h-3 mb-3" />
          <Slider
            value={[project.progresso]}
            onValueChange={(v) => onUpdate(project.id, { progresso: v[0] })}
            max={100}
            step={5}
          />
        </div>
      </div>

      {/* Tarefas do Projeto */}
      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-foreground">Tarefas do Projeto</h3>
          <Button
            size="sm"
            className="gap-1.5"
            onClick={() => {
              setEditingTask(null);
              setTaskModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhuma tarefa adicionada ainda.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {tasks.map((t) => (
                  <SortableTaskWrapper
                    key={t.id}
                    task={t}
                    collaboratorName={collaborators.find(c => String(c.id) === String(t.collaborator_id))?.name}
                    onClick={() => setDetailTask(t)}
                    onEdit={() => {
                      setEditingTask(t);
                      setTaskModalOpen(true);
                    }}
                    onDelete={() => setDeleteTaskId(t.id)}
                    onStatusChange={(s) => {
                      const updates: Partial<ProjectTaskFormData> = { status: s as ProjectTask['status'] };
                      if (s === 'concluido') {
                        updates.data_conclusao = new Date().toISOString();
                      } else {
                        updates.data_conclusao = undefined;
                      }
                      updateTask(t.id, updates);
                    }}
                    onPriorityChange={(p) => updateTask(t.id, { prioridade: p as ProjectTask['prioridade'] })}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Tarefas de Áreas Vinculadas */}
      {linkedTasks.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Link className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-lg font-bold text-foreground">Tarefas de Áreas Vinculadas</h3>
          </div>
          <div className="space-y-2">
            {linkedTasks.map((t) => {
              const now = new Date();
              const endDate = t.data ? new Date(t.data) : null;
              const isCompleted = t.status === 'concluido';
              const isOverdue = !isCompleted && endDate && endDate < now;

              return (
                <div
                  key={t.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/30"
                >
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full shrink-0',
                      isCompleted ? 'bg-emerald-500' : isOverdue ? 'bg-red-500' : 'bg-[#c5c5c5]'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{t.titulo}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.areas?.nome || 'Sem área'}
                      {t.collaborators?.name && ` · ${t.collaborators.name}`}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase shrink-0',
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : isOverdue
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {isCompleted ? 'Concluído' : isOverdue ? 'Atrasado' : 'Em dia'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <BlockingDialog
        open={blockingOpen}
        onOpenChange={(open) => {
          setBlockingOpen(open);
          if (!open) setPendingStatus(null);
        }}
        projectTasks={tasks}
        onConfirm={handleBlockingConfirm}
      />

      <ProjectTaskDetailModal
        open={detailTask !== null}
        onOpenChange={(open) => !open && setDetailTask(null)}
        task={detailTask}
        collaborators={collaborators}
      />

      <ProjectTaskModal
        open={taskModalOpen}
        onOpenChange={(open) => {
          setTaskModalOpen(open);
          if (!open) setEditingTask(null);
        }}
        task={editingTask}
        projectId={project.id}
        collaborators={collaborators}
        onSave={handleSaveTask}
      />

      <AlertDialog open={deleteTaskId !== null} onOpenChange={(open) => !open && setDeleteTaskId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir tarefa</AlertDialogTitle>
            <AlertDialogDescription>Tem certeza que deseja excluir esta tarefa?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteTask} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
