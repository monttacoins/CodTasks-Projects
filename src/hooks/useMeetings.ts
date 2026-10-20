import { useState, useEffect, useCallback } from 'react';
import {
  getMeetings,
  addMeeting,
  updateMeeting,
  deleteMeeting,
  addResolution,
  updateResolution,
  deleteResolution,
} from '@/lib/meetingsApi';
import type { Meeting } from '@/types/meetings';

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  const updateResolutionInState = useCallback(
    (resolutionId: string, updates: { texto?: string; concluido?: boolean; observacoes?: string }) => {
      setMeetings((currentMeetings) =>
        currentMeetings.map((meeting) => ({
          ...meeting,
          resolutions: (meeting.resolutions || []).map((resolution) =>
            resolution.id === resolutionId
              ? {
                  ...resolution,
                  ...updates,
                }
              : resolution
          ),
        }))
      );
    },
    []
  );

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    const data = await getMeetings();
    setMeetings(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  const createMeeting = async (data_reuniao: string) => {
    const result = await addMeeting(data_reuniao);
    if (result) await fetchMeetings();
    return result;
  };

  const editMeeting = async (id: string, updates: { data_reuniao?: string; resumo?: string }) => {
    const success = await updateMeeting(id, updates);
    if (success) {
      setMeetings((current) =>
        current.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
    }
    return success;
  };

  const removeMeeting = async (id: string) => {
    const success = await deleteMeeting(id);
    if (success) await fetchMeetings();
    return success;
  };

  const createResolution = async (meeting_id: string, texto: string, ordem: number) => {
    const result = await addResolution(meeting_id, texto, ordem);
    if (result) await fetchMeetings();
    return result;
  };

  const editResolution = async (id: string, updates: { texto?: string; concluido?: boolean; observacoes?: string }) => {
    const success = await updateResolution(id, updates);
    if (success) updateResolutionInState(id, updates);
    return success;
  };

  const removeResolution = async (id: string) => {
    const success = await deleteResolution(id);
    if (success) await fetchMeetings();
    return success;
  };

  return {
    meetings,
    loading,
    createMeeting,
    editMeeting,
    removeMeeting,
    createResolution,
    editResolution,
    removeResolution,
    refetch: fetchMeetings,
  };
}
