import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface ActionCounts {
  pendingByProject: Record<string, number>;
  totalPending: number;
  refresh: () => void;
}

export function useActionCounts(): ActionCounts {
  const [pendingByProject, setPendingByProject] = useState<Record<string, number>>({});
  const [totalPending, setTotalPending] = useState(0);

  const refresh = useCallback(async () => {
    const { data, error } = await supabase
      .from('project_actions')
      .select('project_id, concluido');

    if (error) return;

    const counts: Record<string, number> = {};
    let total = 0;

    (data || []).forEach((row: { project_id: string; concluido: boolean }) => {
      if (!row.concluido) {
        counts[row.project_id] = (counts[row.project_id] || 0) + 1;
        total += 1;
      }
    });

    setPendingByProject(counts);
    setTotalPending(total);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { pendingByProject, totalPending, refresh };
}
