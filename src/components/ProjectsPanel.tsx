import { useState } from 'react';
import { Plus, GripVertical } from 'lucide-react';
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
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/ProjectCard';
import { ProjectModal } from '@/components/ProjectModal';
import { ProjectDetail } from '@/components/ProjectDetail';
import { useProjects } from '@/hooks/useProjects';
import { toast } from 'sonner';
import type { Project, ProjectFormData } from '@/types/projects';
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

function SortableProjectCard({
  project,
  onClick,
  onEdit,
  onDelete,
}: {
  project: Project;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: project.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div
        {...attributes}
        {...listeners}
        className="absolute top-3 left-2 z-10 cursor-grab active:cursor-grabbing p-1 rounded hover:bg-muted/60 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="pl-6">
        <ProjectCard project={project} onClick={onClick} onEdit={onEdit} onDelete={onDelete} />
      </div>
    </div>
  );
}

export function ProjectsPanel() {
  const { projects, createProject, updateProject, deleteProject, setBlocking, clearBlocking, reorderProjects } = useProjects();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const activeProject = selectedProject
    ? projects.find((p) => p.id === selectedProject.id) || null
    : null;

  const handleSave = async (data: ProjectFormData) => {
    if (editingProject) {
      await updateProject(editingProject.id, data);
      toast.success('Projeto atualizado!');
    } else {
      await createProject(data);
      toast.success('Projeto criado!');
    }
    setEditingProject(null);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      await deleteProject(deleteId);
      if (selectedProject?.id === deleteId) setSelectedProject(null);
      toast.success('Projeto excluído!');
      setDeleteId(null);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = projects.findIndex((p) => p.id === active.id);
    const newIndex = projects.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(projects, oldIndex, newIndex);
    reorderProjects(reordered.map((p) => p.id));
  };

  if (activeProject) {
    return (
      <ProjectDetail
        project={activeProject}
        onBack={() => setSelectedProject(null)}
        onUpdate={(id, data) => updateProject(id, data)}
        onSetBlocking={setBlocking}
        onClearBlocking={clearBlocking}
      />
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          {projects.length} projeto{projects.length !== 1 ? 's' : ''}
        </p>
        <Button
          size="sm"
          className="gap-1.5"
          onClick={() => {
            setEditingProject(null);
            setModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Projeto
        </Button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Nenhum projeto ainda</p>
          <p className="text-sm mt-1">Clique em "Novo Projeto" para começar.</p>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={projects.map((p) => p.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <SortableProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => setSelectedProject(project)}
                  onEdit={(e) => {
                    e.stopPropagation();
                    setEditingProject(project);
                    setModalOpen(true);
                  }}
                  onDelete={(e) => {
                    e.stopPropagation();
                    setDeleteId(project.id);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <ProjectModal
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setEditingProject(null);
        }}
        project={editingProject}
        onSave={handleSave}
      />

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir projeto</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.
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
    </>
  );
}
