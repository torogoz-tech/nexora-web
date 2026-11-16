import type { TaskPurpose } from '../types/TaskPurpose'

export function parseTaskPurpose(value: unknown, workflowVersion: unknown): TaskPurpose {
  // Older list responses omitted purpose; a pinned workflow identifies workflow work.
  if (value === undefined) return workflowVersion == null ? 'general' : 'implementation'
  if (value === 'general' || value === 'implementation' || value === 'product_design') return value
  throw Error('La tarea no es válida.')
}
