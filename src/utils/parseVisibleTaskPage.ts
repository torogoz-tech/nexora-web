import { parseTaskCreator } from './parseTaskCreator'
import { parseTaskTypeIcon } from './parseTaskTypeIcon'
import { parseTaskParticipants } from './parseTaskParticipants'
import { parseDeveloperBoardPage } from './parseDeveloperBoardPage'
import { requireRecord } from './requireRecord'
import type { VisibleTaskPage } from '../types/VisibleTaskPage'
import type { VisibleTask } from '../types/VisibleTask'
export function parseVisibleTaskPage(value: unknown): VisibleTaskPage {
  const v = requireRecord(value),
    page = parseDeveloperBoardPage(v)
  if (!Number.isSafeInteger(v.total) || Number(v.total) < 0)
    throw new Error('La cantidad de tareas no es válida.')
  const items = page.items.map((value) => {
    const t = requireRecord(value)
    if (
      ![
        'type_code',
        'type_name',
        'created_by',
        'updated_at',
      ].every((key) => typeof t[key] === 'string') ||
      !['state_name', 'workflow_id'].every(key => (t.lifecycle === 'pending' || t.purpose === 'general' && t.workflow_version_id === null) ? t[key] === null : typeof t[key] === 'string') ||
      (t.state_changed_at != null && (typeof t.state_changed_at !== 'string' || !Number.isFinite(Date.parse(t.state_changed_at)))) ||
      typeof t.archived !== 'boolean' ||
      (t.assignee_name !== null && typeof t.assignee_name !== 'string')
    )
      throw new Error('La tarea del listado no es válida.')
    return { ...t, creator: t.creator == null ? null : parseTaskCreator(t.creator), assignee: t.assignee == null ? null : parseTaskCreator(t.assignee), type_icon: parseTaskTypeIcon(t.type_icon) } as VisibleTask
  })
  return {
    ...page,
    items,
    total: Number(v.total),
    ...(v.participants !== undefined
      ? { participants: parseTaskParticipants(v.participants) }
      : {}),
  }
}
