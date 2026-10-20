import { useState, useEffect, useCallback } from 'react';
import { getTasksByArea, getAllTasks, addTask, deleteTask, updateTask, updateTaskStatus, callWebhook, getAreas } from '@/lib/api';
import type { Task, TaskFormData, TaskPriority } from '@/types';

export function useTasks(areaId: string | null) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    if (areaId) {
      const data = await getTasksByArea(areaId);
      setTasks(data);
    } else {
      const data = await getAllTasks();
      setTasks(data);
    }
    setLoading(false);
  }, [areaId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const getAreaName = async (areaId: string): Promise<string> => {
    const areas = await getAreas();
    const area = areas.find(a => a.id === areaId);
    return area ? area.nome : 'Área Desconhecida';
  };

  const createTask = async (taskData: TaskFormData) => {
    const newTask = await addTask(taskData);
    if (newTask) {
      const areaName = await getAreaName(taskData.area_id);
      await callWebhook({
        action_type: "CREATE",
        area_name: areaName,
        task: newTask
      });
      await fetchTasks();
      return newTask;
    }
    return null;
  };

  const removeTask = async (id: string) => {
    const success = await deleteTask(id);
    if (success) {
      await fetchTasks();
    }
    return success;
  };

  const editTask = async (id: string, taskData: Partial<TaskFormData>, areaId: string) => {
    const updatedTask = await updateTask(id, taskData);
    if (updatedTask) {
      const areaName = await getAreaName(areaId);
      await callWebhook({
        action_type: "UPDATE",
        area_name: areaName,
        task: updatedTask
      });
      await fetchTasks();
      return updatedTask;
    }
    return null;
  };

  const changeStatus = async (id: string, status: Task['status'], areaId: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return false;
    
    const result = await updateTaskStatus(id, status);
    if (result.success) {
      // Use the new area if task was moved to "Z - Concluídos"
      const finalAreaId = result.newAreaId || areaId;
      const areaName = await getAreaName(finalAreaId);
      await callWebhook({
        action_type: "STATUS_UPDATE",
        area_name: areaName,
        task: { ...task, status, area_id: finalAreaId }
      });
      await fetchTasks();
    }
    return result.success;
  };

  const changePriority = async (id: string, priority: TaskPriority, areaId: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return false;
    
    const updatedTask = await updateTask(id, { prioridade: priority });
    if (updatedTask) {
      const areaName = await getAreaName(areaId);
      await callWebhook({
        action_type: "PRIORITY_UPDATE",
        area_name: areaName,
        task: updatedTask
      });
      await fetchTasks();
      return true;
    }
    return false;
  };

  return {
    tasks,
    loading,
    createTask,
    removeTask,
    editTask,
    changeStatus,
    changePriority,
    refetch: fetchTasks
  };
}
