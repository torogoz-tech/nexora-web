import type { ServiceRequest } from '../types/ServiceRequest'
import { requireRecord } from './requireRecord'
export function parseServiceRequest(value: unknown): ServiceRequest {
  const v = requireRecord(value)
  if (typeof v.id !== 'string' || typeof v.title !== 'string' || typeof v.body !== 'string' || typeof v.type_id !== 'string' || typeof v.revision !== 'number' || typeof v.number !== 'number' || !['new', 'in_progress', 'completed'].includes(String(v.status))) throw Error('La solicitud recibida no es válida.')
  return v as ServiceRequest
}
