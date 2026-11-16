import { parseTaskTypeIcon } from './parseTaskTypeIcon'
import { requireRecord } from './requireRecord'
import type { CatalogTaskType } from '../types/CatalogTaskType'
export function parseCatalogTaskTypePage(value: unknown) {
  const page = requireRecord(value)
  if (
    !Array.isArray(page.items) ||
    (page.next_after != null && typeof page.next_after !== 'string')
  )
    throw Error('No pudimos leer el catálogo de tipos de tarea.')
  const items = page.items.map((value) => {
    const t = requireRecord(value)
    if (
      typeof t.code !== 'string' ||
      typeof t.name !== 'string' ||
      typeof t.archived !== 'boolean' ||
      !Number.isSafeInteger(t.revision) ||
      Number(t.revision) < 1 ||
      (t.description !== null && typeof t.description !== 'string') ||
      (t.color !== null &&
        (typeof t.color !== 'string' || !/^#[0-9a-f]{6}$/i.test(t.color)))
    )
      throw Error('El tipo de tarea no es válido.')
    return { ...t, icon: parseTaskTypeIcon(t.icon) } as CatalogTaskType
  })
  return { items, next_after: page.next_after ?? null }
}
