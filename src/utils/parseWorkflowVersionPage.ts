import { requireRecord } from './requireRecord'
import { parseWorkflowVersionSummary } from './parseWorkflowVersionSummary'
import type { WorkflowVersionPage } from '../types/WorkflowVersionPage'
export function parseWorkflowVersionPage(value: unknown): WorkflowVersionPage {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.items) ||
    (v.next_before !== null &&
      (!Number.isSafeInteger(v.next_before) || Number(v.next_before) < 1))
  )
    throw new Error('El historial del workflow no es válido.')
  return {
    items: v.items.map(parseWorkflowVersionSummary),
    next_before: v.next_before as number | null,
  }
}
