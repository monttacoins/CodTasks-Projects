CREATE TABLE public.project_actions (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE, texto text NOT NULL DEFAULT '', concluido boolean NOT NULL DEFAULT false, ordem integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now());
GRANT SELECT, INSERT, UPDATE, DELETE ON public.project_actions TO anon, authenticated;
GRANT ALL ON public.project_actions TO service_role;
ALTER TABLE public.project_actions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all on project_actions" ON public.project_actions FOR ALL USING (true) WITH CHECK (true);