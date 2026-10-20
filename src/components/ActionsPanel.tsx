import { useEffect, useState } from 'react';
import { ArrowLeft, Plus, Trash2, ListChecks, Pencil, Check, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Project } from '@/types/projects';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ProjectAction {
  id: string;
  project_id: string;
  texto: string;
  concluido: boolean;
  ordem: number;
}

interface ActionsPanelProps {
  projects: Project[];
  pendingByProject?: Record<string, number>;
  onCountsChange?: () => void;
}

export function ActionsPanel({ projects, pendingByProject = {}, onCountsChange }: ActionsPanelProps) {
  const [selected, setSelected] = useState<Project | null>(null);
  const [actions, setActions] = useState<ProjectAction[]>([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  useEffect(() => {
    if (!selected) return;
    setEditingId(null);
    setLoading(true);
    supabase
      .from('project_actions')
      .select('*')
      .eq('project_id', selected.id)
      .order('ordem')
      .order('created_at')
      .then(({ data, error }) => {
        if (error) toast.error('Erro ao carregar ações');
        setActions((data as ProjectAction[]) || []);
        setLoading(false);
      });
  }, [selected]);

  const add = async () => {
    const texto = text.trim();
    if (!texto || !selected) return;
    const { data, error } = await supabase
      .from('project_actions')
      .insert({ project_id: selected.id, texto, ordem: actions.length })
      .select()
      .single();
    if (error) return toast.error('Erro ao adicionar ação');
    setActions((a) => [...a, data as ProjectAction]);
    setText('');
    onCountsChange?.();
  };

  const toggle = async (act: ProjectAction) => {
    setActions((a) => a.map((x) => (x.id === act.id ? { ...x, concluido: !x.concluido } : x)));
    const { error } = await supabase.from('project_actions').update({ concluido: !act.concluido }).eq('id', act.id);
    if (error) toast.error('Erro ao atualizar ação');
    else onCountsChange?.();
  };

  const remove = async (id: string) => {
    setActions((a) => a.filter((x) => x.id !== id));
    const { error } = await supabase.from('project_actions').delete().eq('id', id);
    if (error) toast.error('Erro ao excluir ação');
    else onCountsChange?.();
  };

  const startEdit = (act: ProjectAction) => {
    setEditingId(act.id);
    setEditText(act.texto);
  };

  const saveEdit = async (act: ProjectAction) => {
    const texto = editText.trim();
    if (!texto) return toast.error('A ação não pode ficar vazia');
    setEditingId(null);
    if (texto === act.texto) return;
    setActions((a) => a.map((x) => (x.id === act.id ? { ...x, texto } : x)));
    const { error } = await supabase.from('project_actions').update({ texto }).eq('id', act.id);
    if (error) toast.error('Erro ao editar ação');
  };

  if (!selected) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {projects.length === 0 && <p className="text-muted-foreground">Nenhum projeto cadastrado.</p>}
        {projects.map((p) => {
          const pending = pendingByProject[p.id] || 0;
          return (
            <button
              key={p.id}
              onClick={() => setSelected(p)}
              className="text-left rounded-lg border border-border bg-card p-4 hover:border-primary transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <ListChecks className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-medium truncate">{p.nome}</span>
                </div>
                <span
                  className={cn(
                    'shrink-0 inline-flex h-5 min-w-[22px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums',
                    pending > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  )}
                >
                  {pending > 99 ? '99+' : pending}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {pending > 0
                  ? `${pending} ${pending !== 1 ? 'ações pendentes' : 'ação pendente'}`
                  : 'Nenhuma ação pendente'}
              </p>
            </button>
          );
        })}
      </div>
    );
  }

  const done = actions.filter((a) => a.concluido).length;
  const pending = actions.length - done;

  return (
    <div className="max-w-2xl rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => { setSelected(null); setActions([]); setEditingId(null); }}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-semibold flex-1 truncate">{selected.nome}</h2>
        <span
          className={cn(
            'shrink-0 inline-flex h-5 min-w-[22px] items-center justify-center rounded-full px-2 text-[11px] font-semibold tabular-nums',
            pending > 0 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          )}
        >
          {pending > 0 ? `${pending} pendente${pending !== 1 ? 's' : ''}` : 'Em dia'}
        </span>
        <span className="hidden sm:inline text-sm text-muted-foreground">{done}/{actions.length} concluídas</span>
      </div>

      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Nova Ação" />
        <Button type="submit"><Plus className="h-4 w-4 mr-1" />Adicionar</Button>
      </form>

      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : actions.length === 0 ? (
        <p className="text-muted-foreground text-sm">Nenhuma ação ainda.</p>
      ) : (
        <ul className="space-y-1">
          {actions.map((a) => (
            <li key={a.id} className="group flex items-center gap-3 rounded-md px-2 py-2 hover:bg-muted/50">
              {editingId === a.id ? (
                <>
                  <Input
                    autoFocus
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); saveEdit(a); }
                      if (e.key === 'Escape') { e.preventDefault(); setEditingId(null); }
                    }}
                    className="flex-1"
                  />
                  <Button size="icon" variant="secondary" onClick={() => saveEdit(a)} aria-label="Salvar edição">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} aria-label="Cancelar edição">
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <>
                  <Checkbox checked={a.concluido} onCheckedChange={() => toggle(a)} />
                  <span
                    onDoubleClick={() => startEdit(a)}
                    className={cn('flex-1 text-sm', a.concluido && 'line-through text-muted-foreground')}
                  >
                    {a.texto}
                  </span>
                  <button
                    onClick={() => startEdit(a)}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-primary"
                    aria-label="Editar ação"
                    title="Editar ação"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => remove(a.id)}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                    aria-label="Excluir ação"
                    title="Excluir ação"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
