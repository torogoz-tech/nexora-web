import { parseTaskTypeIcon } from './parseTaskTypeIcon'
import { requireRecord } from './requireRecord'
import type { VisibleTaskTypePage } from '../types/VisibleTaskTypePage'
export function parseVisibleTaskTypePage(value: unknown): VisibleTaskTypePage {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.items) ||
    !Number.isSafeInteger(v.total) ||
    Number(v.total) < 0 ||
    (v.next_after !== null && typeof v.next_after !== 'string')
  )
    throw new Error('Los tipos de tarea no son válidos.')
  return {
    items: v.items.map((value) => {
      const t = requireRecord(value)
      if (
        typeof t.code !== 'string' ||
        typeof t.name !== 'string' ||
        !Number.isSafeInteger(t.total) ||
        Number(t.total) < 0 ||
        (t.color !== null &&
          (typeof t.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(t.color)))
      )
        throw new Error('El contador del tipo de tarea no es válido.')
      return {
        icon: parseTaskTypeIcon(t.icon),
        code: t.code,
        name: t.name,
        color: t.color as string | null,
        total: Number(t.total),
      }
    }),
    next_after: v.next_after,
    total: Number(v.total),
  }
}
