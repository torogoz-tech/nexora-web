import { requireRecord } from './requireRecord'
import type { DeveloperRatingDirectory } from '../types/DeveloperRatingDirectory'
export function parseDeveloperRatingDirectory(value: unknown): DeveloperRatingDirectory {
  const v = requireRecord(value)
  if (!Array.isArray(v.items) || typeof v.has_more !== 'boolean' || (v.next_after !== null && typeof v.next_after !== 'string')) throw Error('El registro de calificaciones no es válido.')
  return { has_more: v.has_more, next_after: v.next_after, items: v.items.map(raw => {
    const m = requireRecord(raw)
    if (typeof m.id !== 'string' || typeof m.name !== 'string' || !Array.isArray(m.projects)) throw Error('El registro de calificaciones no es válido.')
    return {can_view_evaluations:m.can_view_evaluations===true,can_rate:m.can_rate===true, id: m.id, name: m.name, projects: m.projects.map(raw => {
      const p = requireRecord(raw)
      if (typeof p.id !== 'string' || typeof p.name !== 'string') throw Error('El registro de calificaciones no es válido.')
      return { id: p.id, name: p.name }
    }) }
  }) }
}
