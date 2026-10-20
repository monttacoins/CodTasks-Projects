import { useState, useEffect, useCallback } from 'react';
import { getCollaborators } from '@/lib/api';
import type { Collaborator } from '@/types';

export function useCollaborators() {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCollaborators = useCallback(async () => {
    setLoading(true);
    const data = await getCollaborators();
    setCollaborators(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchCollaborators();
  }, [fetchCollaborators]);

  return {
    collaborators,
    loading,
    refetch: fetchCollaborators
  };
}
