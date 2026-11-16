import { requireRecord } from './requireRecord'
import { parseWorkflowSummary } from './parseWorkflowSummary'
import type { WorkflowPage } from '../types/WorkflowPage'
export function parseWorkflowPage(value: unknown): WorkflowPage {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.items) ||
    (v.next_after !== null && typeof v.next_after !== 'string')
  )
    throw new Error('La lista de workflows no es válida.')
  return { items: v.items.map(parseWorkflowSummary), next_after: v.next_after }
}
