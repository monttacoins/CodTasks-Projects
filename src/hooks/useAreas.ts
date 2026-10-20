import { useState, useEffect, useCallback } from 'react';
import { getAreas, addArea, deleteArea, updateArea } from '@/lib/api';
import type { Area } from '@/types';

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null);

  const fetchAreas = useCallback(async () => {
    setLoading(true);
    const data = await getAreas();
    setAreas(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAreas();
  }, [fetchAreas]);

  const createArea = async (nome: string) => {
    await addArea(nome);
    await fetchAreas();
  };

  const removeArea = async (id: string) => {
    await deleteArea(id);
    if (selectedAreaId === id) {
      setSelectedAreaId(null);
    }
    await fetchAreas();
  };

  const editArea = async (id: string, nome: string) => {
    await updateArea(id, nome);
    await fetchAreas();
  };

  const selectedArea = areas.find(a => a.id === selectedAreaId) || null;

  return {
    areas,
    loading,
    selectedAreaId,
    selectedArea,
    setSelectedAreaId,
    createArea,
    removeArea,
    editArea,
    refetch: fetchAreas
  };
}
