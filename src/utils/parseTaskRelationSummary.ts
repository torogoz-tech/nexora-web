import { requireRecord } from './requireRecord'
import type { TaskRelationSummary } from '../types/TaskRelationSummary'
export function parseTaskRelationSummary(value: unknown): TaskRelationSummary {
  const v = requireRecord(value)
  if (!['id', 'title'].every(key => typeof v[key] === 'string' && !!v[key]) ||
    !['project_id', 'assignee_id', 'relation_id'].every(key => v[key] === null || (typeof v[key] === 'string' && !!v[key])) ||
    !['pending', 'active', 'paused', 'completed'].includes(String(v.lifecycle)) ||
    !Number.isSafeInteger(v.revision) || Number(v.revision) < 1 ||
    (v.relation_revision !== null && (!Number.isSafeInteger(v.relation_revision) || Number(v.relation_revision) < 1))) throw Error('Las relaciones de la tarea no son válidas.')
  if(v.work_kind!==undefined&&v.work_kind!=='decomposition'&&v.work_kind!=='corrective')throw Error('El trabajo de la subtarea no es válido.')
  if(v.stage_completed!==undefined&&typeof v.stage_completed!=='boolean')throw Error('La etapa de la subtarea no es válida.')
  return v as TaskRelationSummary
}
