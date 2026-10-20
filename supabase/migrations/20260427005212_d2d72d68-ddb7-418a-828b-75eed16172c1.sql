-- 1. Add column to both tables
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS project_name text;
ALTER TABLE public.project_tasks ADD COLUMN IF NOT EXISTS project_name text;

-- 2. Backfill existing rows
UPDATE public.tasks t
SET project_name = p.nome
FROM public.projects p
WHERE t.project_id = p.id;

UPDATE public.project_tasks pt
SET project_name = p.nome
FROM public.projects p
WHERE pt.project_id = p.id;

-- 3. Function to set project_name on tasks/project_tasks based on project_id
CREATE OR REPLACE FUNCTION public.set_task_project_name()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.project_id IS NULL THEN
    NEW.project_name := NULL;
  ELSE
    SELECT nome INTO NEW.project_name
    FROM public.projects
    WHERE id = NEW.project_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_tasks_set_project_name ON public.tasks;
CREATE TRIGGER trg_tasks_set_project_name
BEFORE INSERT OR UPDATE OF project_id ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.set_task_project_name();

DROP TRIGGER IF EXISTS trg_project_tasks_set_project_name ON public.project_tasks;
CREATE TRIGGER trg_project_tasks_set_project_name
BEFORE INSERT OR UPDATE OF project_id ON public.project_tasks
FOR EACH ROW EXECUTE FUNCTION public.set_task_project_name();

-- 4. Function to propagate project rename to all related tasks
CREATE OR REPLACE FUNCTION public.propagate_project_name_change()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.nome IS DISTINCT FROM OLD.nome THEN
    UPDATE public.tasks SET project_name = NEW.nome WHERE project_id = NEW.id;
    UPDATE public.project_tasks SET project_name = NEW.nome WHERE project_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_projects_propagate_name ON public.projects;
CREATE TRIGGER trg_projects_propagate_name
AFTER UPDATE OF nome ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.propagate_project_name_change();