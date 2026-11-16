import { parseTaskTypeIcon } from './parseTaskTypeIcon'
import { requireRecord } from './requireRecord'
import type { ProjectTaskType } from '../types/ProjectTaskType'
export function parseProjectTaskTypePage(value: unknown): {
  items: ProjectTaskType[]
  next_after: string | null
} {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.items) ||
    (v.next_after !== undefined &&
      v.next_after !== null &&
      typeof v.next_after !== 'string')
  )
    throw new Error('El catálogo de tipos de tarea no es válido.')
  return {
    items: v.items.map((value) => {
      const t = requireRecord(value)
      if (
        !['code', 'project_id', 'name'].every(
          (key) => typeof t[key] === 'string',
        ) ||
        typeof t.archived !== 'boolean'
      )
        throw new Error('El tipo de tarea no es válido.')
      return {
        icon: parseTaskTypeIcon(t.icon),
        code: String(t.code),
        project_id: String(t.project_id),
        name: String(t.name),
        archived: t.archived,
      }
    }),
    next_after: v.next_after ?? null,
  }
}
