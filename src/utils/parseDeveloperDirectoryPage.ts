import {parseDeveloperWorkflowAssignments} from './parseDeveloperWorkflowAssignments'
import type {MemberRole} from '../types/MemberRole'
import { requireRecord } from './requireRecord'
import type { DeveloperDirectoryPage } from '../types/DeveloperDirectoryPage'
export function parseDeveloperDirectoryPage(
  value: unknown,
): DeveloperDirectoryPage {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.items) ||
    (v.next_after !== null && typeof v.next_after !== 'string')
  )
    throw Error('El directorio de desarrolladores no es válido.')
  return {
    items: v.items.map((value) => {
      const e = requireRecord(value)
      if (
        typeof e.id !== 'string' ||
        typeof e.name !== 'string' ||
        !Number.isSafeInteger(e.assignment_revision) ||
        Number(e.assignment_revision) < 0 ||
        (e.workflow_id === null
          ? e.workflow_version_id !== null || e.assignment_revision !== 0
          : typeof e.workflow_version_id !== 'string' ||
            Number(e.assignment_revision) < 1) ||
        (e.workflow_id !== null && typeof e.workflow_id !== 'string') ||
        (e.workflow_version_id !== null &&
          typeof e.workflow_version_id !== 'string')
      )
        throw Error('El desarrollador no es válido.')
      return {
        role: e.role as MemberRole | null | undefined,
        workflows: e.workflows===undefined?undefined:parseDeveloperWorkflowAssignments(e.workflows),
        id: e.id,
        name: e.name,
        assignment_revision: Number(e.assignment_revision),
        workflow_id: e.workflow_id as string | null,
        workflow_version_id: e.workflow_version_id as string | null,
      }
    }),
    next_after: v.next_after as string | null,
  }
}
