import { requireRecord } from './requireRecord'
import type { TaskParticipant } from '../types/TaskParticipant'
export function parseTaskParticipants(value: unknown): TaskParticipant[] {
  if (!Array.isArray(value))
    throw new Error('Las personas del tablero no son válidas.')
  const seen = new Set<string>()
  return value.map((value) => {
    const p = requireRecord(value)
    if (
      typeof p.actor_id !== 'string' ||
      !p.actor_id ||
      typeof p.name !== 'string' ||
      !Number.isSafeInteger(p.total) ||
      Number(p.total) < 1 ||
      seen.has(p.actor_id)
    )
      throw new Error('El responsable del tablero no es válido.')
    seen.add(p.actor_id)
    return { actor_id: p.actor_id, name: p.name, total: Number(p.total) }
  })
}
