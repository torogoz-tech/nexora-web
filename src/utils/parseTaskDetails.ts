import { parseTaskPurpose } from './parseTaskPurpose'
import { parseTaskCreator } from './parseTaskCreator'
import { parseTaskKnowledge } from './parseTaskKnowledge'
import { parseTaskLifecycle } from './parseTaskLifecycle'
import { requireRecord } from './requireRecord'
import type { TaskDetails } from '../types/TaskDetails'
export function parseTaskDetails(value: unknown): TaskDetails {
  const source = requireRecord(value)
  const v: Record<string, unknown> = { ...source, purpose: parseTaskPurpose(source.purpose, source.workflow_version_id) }
  if (
    !['id', 'title', 'context', 'created_by'].every(
      (key) => typeof v[key] === 'string',
    ) ||
    (v.project_id !== null && typeof v.project_id !== 'string') ||
    (v.lifecycle !== undefined && (!['workflow_id', 'workflow_version_id', 'state_id'].every(key => (v.lifecycle === 'pending' || v.purpose === 'general' && v.workflow_version_id === null) ? v[key] === null : typeof v[key] === 'string') || (v.assignee_id !== null && typeof v.assignee_id !== 'string'))) ||
    (v.priority !== undefined && !['low','medium','high','critical'].includes(String(v.priority))) ||
    !Number.isSafeInteger(v.revision) ||
    Number(v.revision) < 1
  )
    throw new Error('El detalle de la tarea no es válido.')
  if (v.acceptance_criteria!==undefined&&(!Array.isArray(v.acceptance_criteria)||!v.acceptance_criteria.every(item=>typeof item==='string'))) throw Error('El detalle de la tarea no es válido.')
  let timing: import('../types/TaskTiming').TaskTiming | undefined
  if (v.timing !== undefined) {
    const x=requireRecord(v.timing)
    if (!Number.isSafeInteger(x.active_seconds)||Number(x.active_seconds)<0||!['started_at','completed_at'].every(key=>x[key]===null||(typeof x[key]==='string'&&Number.isFinite(Date.parse(x[key] as string))))) throw Error('Los tiempos de la tarea no son válidos.')
    timing=x as import('../types/TaskTiming').TaskTiming
  }
  return {
    ...(timing ? {timing} : {}),
    id: String(v.id),
    purpose: v.purpose==='implementation'||v.purpose==='product_design'?v.purpose:'general',
    entry_workflow_id: typeof v.entry_workflow_id==='string'?v.entry_workflow_id:null,
    primary_requirement_id: typeof v.primary_requirement_id==='string'?v.primary_requirement_id:null,
    primary_feature_id: typeof v.primary_feature_id==='string'?v.primary_feature_id:null,
    project_id: v.project_id as string | null,
    lifecycle: parseTaskLifecycle(v.lifecycle),
    workflow_id: typeof v.workflow_id === 'string' ? v.workflow_id : null,
    workflow_version_id: typeof v.workflow_version_id === 'string' ? v.workflow_version_id : null,
    state_id: typeof v.state_id === 'string' ? v.state_id : null,
    assignee_id: typeof v.assignee_id === 'string' ? v.assignee_id : null,
    title: String(v.title),
    context: String(v.context),
    acceptance_criteria: (v.acceptance_criteria??[]) as string[],
    created_by: String(v.created_by),
    ...(v.assignee === undefined ? {} : {assignee: v.assignee===null?null:parseTaskCreator(v.assignee)}),
    ...(v.creator === undefined ? {} : {creator: parseTaskCreator(v.creator)}),
    revision: Number(v.revision),
    resolution: typeof v.resolution === 'string' ? v.resolution : null,
    priority: (v.priority ?? 'medium') as TaskDetails['priority'], blocked: v.blocked === true, archived: v.archived === true,
    type_code: typeof v.type_code === 'string' ? v.type_code : '',
    project_name: typeof v.project_name === 'string' ? v.project_name : null,
    type_name: typeof v.type_name === 'string' ? v.type_name : null,
    assignee_name: typeof v.assignee_name === 'string' ? v.assignee_name : null,
    created_by_name: typeof v.created_by_name === 'string' ? v.created_by_name : null,
    ...(v.knowledge === undefined ? {} : { knowledge: parseTaskKnowledge(v.knowledge) }),
  }
}
