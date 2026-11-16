import { requireRecord } from './requireRecord'
import type { ProjectTaskTypeSelection } from '../types/ProjectTaskTypeSelection'
export function parseProjectTaskTypeSelection(
  value: unknown,
): ProjectTaskTypeSelection {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.codes) ||
    !v.codes.every((c) => typeof c === 'string') ||
    new Set(v.codes).size !== v.codes.length ||
    !Number.isSafeInteger(v.revision) ||
    Number(v.revision) < 0
  )
    throw Error('La selección de tipos de tarea no es válida.')
  return v as ProjectTaskTypeSelection
}
