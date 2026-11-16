import { requireRecord } from './requireRecord'
import type { DeveloperWorkflowAssignment } from '../types/DeveloperWorkflowAssignment'
export function parseDeveloperWorkflowAssignment(
  value: unknown,
): DeveloperWorkflowAssignment {
  const v = requireRecord(value)
  if (
    ![
      'actor_id',
      'actor_name',
      'workflow_id',
      'workflow_version_id',
      'assigned_by',
      'updated_at',
    ].every((key) => typeof v[key] === 'string') ||
    !Number.isSafeInteger(v.revision) ||
    Number(v.revision) < 1
  )
    throw Error('La vinculación del desarrollador no es válida.')
  return v as DeveloperWorkflowAssignment
}
