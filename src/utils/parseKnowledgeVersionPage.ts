import { requireRecord } from './requireRecord'
import type { KnowledgeVersionPage } from '../types/KnowledgeVersionPage'
export function parseKnowledgeVersionPage(
  value: unknown,
): KnowledgeVersionPage {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.items) ||
    (v.next_before !== null &&
      (!Number.isSafeInteger(v.next_before) || Number(v.next_before) < 1))
  )
    throw new Error('El historial de versiones no es válido.')
  return {
    items: v.items.map((value) => {
      const item = requireRecord(value)
      if (
        !['id', 'title', 'created_by', 'created_at'].every(
          (key) => typeof item[key] === 'string',
        ) ||
        !Number.isSafeInteger(item.number) ||
        Number(item.number) < 1
      )
        throw new Error('La versión del historial no es válida.')
      return {
        id: String(item.id),
        number: Number(item.number),
        title: String(item.title),
        created_by: String(item.created_by),
        created_at: String(item.created_at),
      }
    }),
    next_before: v.next_before as number | null,
  }
}
