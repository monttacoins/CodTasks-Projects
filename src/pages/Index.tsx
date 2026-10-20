import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { ActionsPanel } from '@/components/ActionsPanel';
import { ProjectsPanel } from '@/components/ProjectsPanel';
import { AppSidebar } from '@/components/AppSidebar';
import { TaskGrid } from '@/components/TaskGrid';
import { TaskFiltersBar, TaskFilters, emptyFilters, filterTasks } from '@/components/TaskFilters';
import { CalendarFiltersBar, CalendarFiltersState, emptyCalendarFilters, filterCalendarTasks } from '@/components/CalendarFilters';
import { TaskModal } from '@/components/TaskModal';
import { CalendarDashboard } from '@/components/CalendarDashboard';
import { UrgentTasksPanel } from '@/components/UrgentTasksPanel';
import { MeetingsPanel } from '@/components/MeetingsPanel';
import { Button } from "@/components/ui/button";
import { useAreas } from '@/hooks/useAreas';
import { useTasks } from '@/hooks/useTasks';
import { useAllProjectTasks } from '@/hooks/useAllProjectTasks';
import { useProjects } from '@/hooks/useProjects';
import { useCollaborators } from '@/hooks/useCollaborators';
import { useDeadlineAlerts } from '@/hooks/useDeadlineAlerts';
import { useActionCounts } from '@/hooks/useActionCounts';
import { toast } from 'sonner';
import type { Task, TaskFormData, TaskStatus, TaskPriority } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type ViewType = 'calendar' | 'area' | 'meetings' | 'projects' | 'actions';

const Index = () => {
  const { areas, selectedAreaId, selectedArea, setSelectedAreaId, createArea, removeArea, editArea } = useAreas();
  const { tasks, createTask, removeTask, editTask, changeStatus, changePriority } = useTasks(selectedAreaId);
  const { collaborators } = useCollaborators();
  const { projectTasks } = useAllProjectTasks();
  const { projects } = useProjects();
  const { pendingByProject, totalPending, refresh: refreshActionCounts } = useActionCounts();
  
  useDeadlineAlerts(tasks);

  const [selectedView, setSelectedView] = useState<ViewType>('calendar');
  const [filters, setFilters] = useState<TaskFilters>(emptyFilters);
  const [calendarFilters, setCalendarFilters] = useState<CalendarFiltersState>(emptyCalendarFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: 'task' | 'area'; id: string } | null>(null);
  const [showUrgentPanel, setShowUrgentPanel] = useState(true);
  const [prefilledDate, setPrefilledDate] = useState<string | null>(null);

  const filteredTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  const filteredCalendarTasks = useMemo(() => filterCalendarTasks(tasks, calendarFilters), [tasks, calendarFilters]);

  // Navigation handlers
  const handleSelectArea = (id: string) => {
    setSelectedAreaId(id);
    setSelectedView('area');
  };

  const handleSelectCalendar = () => {
    setSelectedAreaId(null);
    setSelectedView('calendar');
  };

  const handleSelectMeetings = () => {
    setSelectedAreaId(null);
    setSelectedView('meetings');
  };

  const handleSelectProjects = () => {
    setSelectedAreaId(null);
    setSelectedView('projects');
  };

  const handleSelectActions = () => {
    setSelectedAreaId(null);
    setSelectedView('actions');
  };

  // Area handlers
  const handleAddArea = async () => {
    const nome = prompt("Nome da nova área:");
    if (nome) {
      await createArea(nome);
      toast.success('Área criada com sucesso!');
    }
  };

  const handleEditArea = async (id: string, currentName: string) => {
    const newName = prompt("Novo nome para a área:", currentName);
    if (newName && newName !== currentName) {
      await editArea(id, newName);
      toast.success('Área atualizada!');
    }
  };

  const handleDeleteArea = async (id: string) => {
    setDeleteConfirm({ type: 'area', id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'area') {
      await removeArea(deleteConfirm.id);
      toast.success('Área excluída!');
    } else {
      await removeTask(deleteConfirm.id);
      toast.success('Tarefa excluída!');
    }
    setDeleteConfirm(null);
  };

  // Task handlers
  const handleOpenNewTask = () => {
    setEditingTask(null);
    setPrefilledDate(null);
    setModalOpen(true);
  };

  const handleOpenNewTaskWithDate = (date: string) => {
    setEditingTask(null);
    setPrefilledDate(date);
    setModalOpen(true);
  };

  const handleEditTaskOpen = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDeleteTask = (id: string) => {
    setDeleteConfirm({ type: 'task', id });
  };

  const handleSaveTask = async (data: TaskFormData) => {
    if (editingTask) {
      await editTask(editingTask.id, data, selectedAreaId!);
    } else {
      await createTask(data);
    }
  };

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    await changeStatus(id, status, selectedAreaId!);
  };

  const handlePriorityChange = async (id: string, priority: TaskPriority) => {
    await changePriority(id, priority, selectedAreaId!);
  };

  // Header info
  const getHeaderTitle = () => {
    if (selectedView === 'calendar') return 'Visão Geral';
    if (selectedView === 'meetings') return 'Reuniões';
    if (selectedView === 'projects') return 'Projetos';
    if (selectedView === 'actions') return 'Ações';
    return selectedArea?.nome || '';
  };

  const getHeaderSubtitle = () => {
    if (selectedView === 'calendar') return 'Calendário de tarefas';
    if (selectedView === 'meetings') return 'Registro de reuniões e resoluções';
    if (selectedView === 'projects') return 'Gerencie seus projetos';
    if (selectedView === 'actions') return 'Lista de ações por projeto';
    return `${filteredTasks.length} tarefa${filteredTasks.length !== 1 ? 's' : ''}`;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar
        areas={areas}
        selectedAreaId={selectedAreaId}
        selectedView={selectedView}
        onSelectArea={handleSelectArea}
        onSelectCalendar={handleSelectCalendar}
        onSelectMeetings={handleSelectMeetings}
        onSelectProjects={handleSelectProjects}
        onSelectActions={handleSelectActions}
        actionsPendingCount={totalPending}
        onAddArea={handleAddArea}
        onEditArea={handleEditArea}
        onDeleteArea={handleDeleteArea}
      />

      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-3 pl-10 lg:pl-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-2xl font-bold text-foreground truncate">
                {getHeaderTitle()}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                {getHeaderSubtitle()}
              </p>
            </div>
            
            {selectedView === 'area' && (
              <Button onClick={handleOpenNewTask} size="sm" className="gap-1.5 shrink-0">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Nova Tarefa</span>
                <span className="sm:hidden">Nova</span>
              </Button>
            )}
          </div>
        </header>

        <div className="p-3 sm:p-6">
          {selectedView !== 'meetings' && selectedView !== 'actions' && showUrgentPanel && (
            <UrgentTasksPanel
              tasks={tasks}
              onTaskClick={handleEditTaskOpen}
              onDismiss={() => setShowUrgentPanel(false)}
            />
          )}

          {selectedView === 'calendar' && (
            <>
              <CalendarFiltersBar
                filters={calendarFilters}
                collaborators={collaborators}
                areas={areas}
                onFilterChange={setCalendarFilters}
                onClear={() => setCalendarFilters(emptyCalendarFilters)}
              />
              <CalendarDashboard 
                tasks={filteredCalendarTasks} 
                projectTasks={projectTasks}
                onCreateTask={handleOpenNewTaskWithDate}
                onEditTask={handleEditTaskOpen}
                onDeleteTask={handleDeleteTask}
              />
            </>
          )}

          {selectedView === 'area' && (
            <>
              <TaskFiltersBar
                filters={filters}
                collaborators={collaborators}
                onFilterChange={setFilters}
                onClear={() => setFilters(emptyFilters)}
              />
              <TaskGrid
                tasks={filteredTasks}
                onEdit={handleEditTaskOpen}
                onDelete={handleDeleteTask}
                onStatusChange={handleStatusChange}
                onPriorityChange={handlePriorityChange}
              />
            </>
          )}

          {selectedView === 'meetings' && (
            <MeetingsPanel />
          )}

          {selectedView === 'actions' && (
            <ActionsPanel
              projects={projects}
              pendingByProject={pendingByProject}
              onCountsChange={refreshActionCounts}
            />
          )}
          {selectedView === 'projects' && (
            <ProjectsPanel />
          )}
        </div>
      </main>

      <TaskModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setPrefilledDate(null);
        }}
        task={editingTask}
        areaId={selectedAreaId || (areas[0]?.id || '')}
        areas={areas}
        collaborators={collaborators}
        projects={projects}
        onSave={handleSaveTask}
        prefilledDate={prefilledDate}
      />

      <AlertDialog open={deleteConfirm !== null} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteConfirm?.type === 'area' 
                ? 'Tem certeza que deseja excluir esta área? Todas as tarefas associadas serão perdidas.'
                : 'Tem certeza que deseja excluir esta tarefa?'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Index;
