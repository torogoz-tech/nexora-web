import { parseTaskPurpose } from './parseTaskPurpose'
import { parseTaskLifecycle } from './parseTaskLifecycle'
import { requireRecord } from './requireRecord'
import type { DeveloperBoardPage } from '../types/DeveloperBoardPage'
import type { DeveloperBoardTask } from '../types/DeveloperBoardTask'
export function parseDeveloperBoardPage(value: unknown): DeveloperBoardPage {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.items) ||
    (v.next_after !== null && typeof v.next_after !== 'string')
  )
    throw Error('El tablero no es válido.')
  return {
    items: v.items.map((value) => {
      const source = requireRecord(value)
      const t: Record<string, unknown> = { ...source, purpose: parseTaskPurpose(source.purpose, source.workflow_version_id) }
      const lifecycle = parseTaskLifecycle(t.lifecycle)
      if (
        ![
          'id',
          'title',
        ].every((key) => typeof t[key] === 'string') ||
        (t.lifecycle !== undefined && (t.project_id === null) !== (t.project_name === null)) ||
        !['project_id', 'project_name'].every(key => t[key] === null || typeof t[key] === 'string') ||
        !['workflow_version_id', 'state_id'].every(key => (lifecycle === 'pending' || t.purpose === 'general' && t.workflow_version_id === null) ? t[key] === null : typeof t[key] === 'string') ||
        (t.assignee_id !== null && typeof t.assignee_id !== 'string') ||
        !Number.isSafeInteger(t.revision) ||
        Number(t.revision) < 1 ||
        typeof t.blocked !== 'boolean' ||
        !['blocking_count', 'subtasks_total', 'subtasks_completed'].every(key => t[key] === undefined || (Number.isSafeInteger(t[key]) && Number(t[key]) >= 0)) ||
        (t.subtasks_total !== undefined && t.subtasks_completed !== undefined && Number(t.subtasks_completed) > Number(t.subtasks_total)) ||
        !['low', 'medium', 'high', 'critical'].includes(String(t.priority))
      )
        throw Error('La tarea no es válida.')
      return { ...t, lifecycle } as DeveloperBoardTask
    }),
    next_after: v.next_after as string | null,
  }
}
