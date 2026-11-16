import { taskTypeIcons } from '../app/taskTypeIcons'
import type { TaskTypeIcon } from '../types/TaskTypeIcon'
export function parseTaskTypeIcon(value: unknown): TaskTypeIcon | undefined {
  if (value === undefined) return undefined
  if (!taskTypeIcons.some((option) => option.value === value))
    throw Error('El icono del tipo de tarea no es válido.')
  return value as TaskTypeIcon
}
