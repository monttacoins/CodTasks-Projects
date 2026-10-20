-- Convert all date/time columns to timestamptz, interpreting existing values as America/Sao_Paulo

-- project_tasks: text -> timestamptz
ALTER TABLE public.project_tasks
  ALTER COLUMN data_inicio TYPE timestamptz
    USING (CASE WHEN data_inicio IS NULL OR data_inicio = '' THEN NULL
                ELSE (data_inicio::timestamp AT TIME ZONE 'America/Sao_Paulo') END),
  ALTER COLUMN data_fim TYPE timestamptz
    USING (CASE WHEN data_fim IS NULL OR data_fim = '' THEN NULL
                ELSE (data_fim::timestamp AT TIME ZONE 'America/Sao_Paulo') END),
  ALTER COLUMN data_conclusao TYPE timestamptz
    USING (CASE WHEN data_conclusao IS NULL OR data_conclusao = '' THEN NULL
                ELSE (data_conclusao::timestamp AT TIME ZONE 'America/Sao_Paulo') END);

-- tasks: timestamp without tz -> timestamptz
ALTER TABLE public.tasks
  ALTER COLUMN data TYPE timestamptz
    USING (data AT TIME ZONE 'America/Sao_Paulo'),
  ALTER COLUMN data_inicio TYPE timestamptz
    USING (data_inicio AT TIME ZONE 'America/Sao_Paulo'),
  ALTER COLUMN data_fim TYPE timestamptz
    USING (data_fim AT TIME ZONE 'America/Sao_Paulo');

-- meetings: date -> timestamptz (00:00 horário de Brasília)
ALTER TABLE public.meetings
  ALTER COLUMN data_reuniao TYPE timestamptz
    USING (data_reuniao::timestamp AT TIME ZONE 'America/Sao_Paulo');