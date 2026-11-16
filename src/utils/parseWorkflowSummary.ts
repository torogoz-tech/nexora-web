import { requireRecord } from './requireRecord'
import { parseWorkflowIcon } from './parseWorkflowIcon'
import type { WorkflowSummary } from '../types/WorkflowSummary'
export function parseWorkflowSummary(value: unknown): WorkflowSummary {
  const v = requireRecord(value)
  if (
    !['id', 'name', 'purpose'].every((key) => typeof v[key] === 'string') ||
    typeof v.archived !== 'boolean' ||
    (v.color != null && (typeof v.color !== 'string' || !/^#[A-Fa-f0-9]{6}$/.test(v.color))) ||
    !Number.isSafeInteger(v.revision) ||
    Number(v.revision) < 1 ||
    !Number.isSafeInteger(v.latest_version_number) ||
    Number(v.latest_version_number) < 0 ||
    (v.latest_version_id !== null && typeof v.latest_version_id !== 'string') ||
    !Array.isArray(v.resource_kinds) ||
    v.project_id != null ||
    v.resource_kinds.length !== 1 ||
    v.resource_kinds[0] !== 'task'
  )
    throw new Error('La definición del workflow no es válida.')
  return {
    id: String(v.id),
    name: String(v.name),
    icon: parseWorkflowIcon(v.icon),
    ...(v.color ? {color:String(v.color)} : {}),
    purpose: String(v.purpose),
    archived: v.archived,
    revision: Number(v.revision),
    latest_version_id: v.latest_version_id as string | null,
    latest_version_number: Number(v.latest_version_number),
    resource_kinds: v.resource_kinds as WorkflowSummary['resource_kinds'],
  }
}
