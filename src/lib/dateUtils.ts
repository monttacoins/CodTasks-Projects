// Utilitários de data para garantir que valores sejam armazenados como
// timestamptz interpretados no fuso horário de Brasília (America/Sao_Paulo).
//
// Os <input type="date"> e <input type="datetime-local"> devolvem strings sem
// fuso (ex.: "2026-04-30" ou "2026-04-30T14:00"). Precisamos anexar o offset
// "-03:00" antes de gravar para que o Postgres interprete corretamente.

const SP_OFFSET = '-03:00';

/**
 * Converte uma string vinda de input HTML (date ou datetime-local) para um
 * ISO 8601 com offset de Brasília. Retorna null para vazio.
 *
 * Exemplos:
 *   "2026-04-30"        -> "2026-04-30T00:00:00-03:00"
 *   "2026-04-30T14:30"  -> "2026-04-30T14:30:00-03:00"
 *   "2026-04-30T14:30:00-03:00" -> mantém (já tem offset)
 *   ISO completo com Z  -> mantém
 */
export function toBrtTimestamptz(value: string | null | undefined): string | null {
  if (value === null || value === undefined) return null;
  const v = String(value).trim();
  if (!v) return null;

  // Já contém fuso (Z ou +/-hh:mm no fim) -> não mexer
  if (/(Z|[+-]\d{2}:?\d{2})$/.test(v)) return v;

  // Apenas data (YYYY-MM-DD)
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
    return `${v}T00:00:00${SP_OFFSET}`;
  }

  // datetime-local: YYYY-MM-DDTHH:mm  ou  YYYY-MM-DDTHH:mm:ss
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(v)) {
    const withSeconds = v.length === 16 ? `${v}:00` : v;
    return `${withSeconds}${SP_OFFSET}`;
  }

  // Fallback: tenta deixar passar como está
  return v;
}

/**
 * Aplica toBrtTimestamptz em um conjunto de campos de um objeto, retornando
 * uma cópia com os campos normalizados. Campos ausentes não são tocados.
 */
export function normalizeDateFields<T extends Record<string, unknown>>(
  obj: T,
  fields: readonly (keyof T)[]
): T {
  const out: Record<string, unknown> = { ...obj };
  for (const f of fields) {
    if (f in out) {
      const v = out[f as string];
      if (typeof v === 'string' || v === null) {
        out[f as string] = toBrtTimestamptz(v as string | null);
      }
    }
  }
  return out as T;
}
