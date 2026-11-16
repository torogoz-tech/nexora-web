import { requireRecord } from './requireRecord'
import { parseServiceRequest } from './parseServiceRequest'
export function parseServiceRequestPage(value: unknown) {
  const v = requireRecord(value)
  if (!Array.isArray(v.items) || typeof v.total !== 'number') throw Error('La respuesta recibida no es válida.')
  return { items: v.items.map(parseServiceRequest), total: v.total, can_manage: v.can_manage === true }
}
