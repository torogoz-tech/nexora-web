import type { TaskLifecycle } from '../types/TaskLifecycle'
export function parseTaskLifecycle(value: unknown): TaskLifecycle {
  if (value === undefined) return 'active'
  if (value === 'pending' || value === 'active' || value === 'paused' || value === 'completed') return value
  throw Error('El ciclo de vida de la tarea no es válido.')
}
