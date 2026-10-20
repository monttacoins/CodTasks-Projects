import { Plus, Menu } from 'lucide-react';
import { useState } from 'react';
import { AreaItem, CalendarLink, MeetingsLink, ProjectsLink, ActionsLink } from './AreaItem';
import { Button } from './ui/button';
import { Sheet, SheetContent } from './ui/sheet';
import type { Area } from '@/types';

interface AppSidebarProps {
  areas: Area[];
  selectedAreaId: string | null;
  selectedView: 'calendar' | 'area' | 'meetings' | 'projects' | 'actions';
  onSelectActions: () => void;
  actionsPendingCount?: number;
  onSelectArea: (id: string) => void;
  onSelectCalendar: () => void;
  onSelectMeetings: () => void;
  onSelectProjects: () => void;
  onAddArea: () => void;
  onEditArea: (id: string, currentName: string) => void;
  onDeleteArea: (id: string) => void;
}

function SidebarContent({
  areas,
  selectedAreaId,
  selectedView,
  onSelectArea,
  onSelectCalendar,
  onSelectMeetings,
  onSelectProjects,
  onSelectActions,
  actionsPendingCount = 0,
  onAddArea,
  onEditArea,
  onDeleteArea,
  onItemClick
}: AppSidebarProps & { onItemClick?: () => void }) {
  return (
    <>
      {/* Header */}
      <div className="p-5 border-b border-sidebar-border">
        <h1 className="text-lg font-bold tracking-tight">CodClick Tasks</h1>
        <p className="text-xs text-sidebar-foreground/60 mt-0.5">Agenda Interna</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="mb-4">
          <span className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
            Navegação
          </span>
        </div>
        
        <ul className="space-y-1">
          <CalendarLink 
            isActive={selectedView === 'calendar'} 
            onSelect={() => {
              onSelectCalendar();
              onItemClick?.();
            }} 
          />
          
          <ProjectsLink
            isActive={selectedView === 'projects'}
            onSelect={() => {
              onSelectProjects();
              onItemClick?.();
            }}
          />
          <ActionsLink
            badge={actionsPendingCount}
            isActive={selectedView === 'actions'}
            onSelect={() => {
              onSelectActions();
              onItemClick?.();
            }}
          />

          <div className="py-2">
            <span className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Áreas
            </span>
          </div>
          
          {areas.map((area) => (
            <AreaItem
              key={area.id}
              area={area}
              isActive={selectedView === 'area' && selectedAreaId === area.id}
              onSelect={() => {
                onSelectArea(area.id);
                onItemClick?.();
              }}
              onEdit={() => onEditArea(area.id, area.nome)}
              onDelete={() => onDeleteArea(area.id)}
            />
          ))}

          {/* Reuniões - always last, non-deletable */}
          <div className="py-2">
            <span className="px-3 text-xs font-semibold text-sidebar-foreground/50 uppercase tracking-wider">
              Outros
            </span>
          </div>

          <MeetingsLink
            isActive={selectedView === 'meetings'}
            onSelect={() => {
              onSelectMeetings();
              onItemClick?.();
            }}
          />
        </ul>
      </nav>

      {/* Add Area Button */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={onAddArea}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-sidebar-primary text-sidebar-primary-foreground rounded-lg font-medium text-sm transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Plus className="h-4 w-4" />
          Nova Área
        </button>
      </div>
    </>
  );
}

export function AppSidebar(props: AppSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-3 left-3 z-50 lg:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="h-6 w-6" />
      </Button>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0 w-72 bg-sidebar text-sidebar-foreground">
          <div className="flex flex-col h-full">
            <SidebarContent {...props} onItemClick={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 min-w-64 bg-sidebar text-sidebar-foreground flex-col border-r border-sidebar-border">
        <SidebarContent {...props} />
      </aside>
    </>
  );
}
