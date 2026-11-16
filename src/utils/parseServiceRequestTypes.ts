import { parseWorkflowIcon } from './parseWorkflowIcon'
import type { RequestSlaPolicy } from '../types/RequestSlaPolicy'
import { requireRecord } from './requireRecord'
export function parseServiceRequestTypes(value: unknown) {
  const v = requireRecord(value)
  if (!Array.isArray(v.items)) throw Error('La respuesta recibida no es válida.')
  return { can_manage: v.can_manage === true, items: v.items.map(item => {
    const t = requireRecord(item)
    if (typeof t.id !== 'string' || typeof t.name !== 'string' || typeof t.revision !== 'number' || typeof t.archived !== 'boolean') throw Error('El tipo recibido no es válido.')
    return { icon: parseWorkflowIcon(t.icon ?? 'headset'), color: typeof t.color === 'string' ? t.color : '#38BDF8', id: t.id, name: t.name, archived: t.archived, revision: t.revision, sla: (t.sla ?? {}) as Record<string,RequestSlaPolicy>, total: typeof t.total === 'number' ? t.total : null }
  }) }
}
