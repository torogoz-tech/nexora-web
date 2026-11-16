export function requireRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value))
    throw new Error('La API devolvió una respuesta no válida.')
  return value as Record<string, unknown>
}
