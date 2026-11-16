import { requireRecord } from './requireRecord'
import type { WorkflowVersionSummary } from '../types/WorkflowVersionSummary'
export function parseWorkflowVersionSummary(
  value: unknown,
): WorkflowVersionSummary {
  const v = requireRecord(value)
  if (
    ![
      'id',
      'workflow_id',
      'name',
      'purpose',
      'checksum',
      'reason',
      'published_at',
      'published_by',
    ].every((key) => typeof v[key] === 'string') ||
    v.project_id != null ||
    !Number.isSafeInteger(v.number) ||
    Number(v.number) < 1
  )
    throw new Error('La versión del workflow no es válida.')
  return {
    id: String(v.id),
    workflow_id: String(v.workflow_id),
    name: String(v.name),
    purpose: String(v.purpose),
    checksum: String(v.checksum),
    reason: String(v.reason),
    published_at: String(v.published_at),
    published_by: String(v.published_by),
    number: Number(v.number),
  }
}
