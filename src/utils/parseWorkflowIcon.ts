import { workflowIcons } from '../app/workflowIcons'
import type { WorkflowIcon } from '../types/WorkflowIcon'
export function parseWorkflowIcon(value: unknown): WorkflowIcon {
  if (value == null) return 'workflow'
  if (typeof value !== 'string' || !workflowIcons.some(option => option.value === value)) throw Error('El icono del workflow no es válido.')
  return value as WorkflowIcon
}
