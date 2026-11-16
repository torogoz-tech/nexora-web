import { requireRecord } from './requireRecord'
import { parseTaskRelationSummary } from './parseTaskRelationSummary'
import type { TaskRelations } from '../types/TaskRelations'
export function parseTaskRelations(value: unknown): TaskRelations {
  const v = requireRecord(value)
  if (!['can_manage', 'can_take', 'can_complete'].every(key => typeof v[key] === 'boolean') ||
    !['subtasks_total', 'subtasks_completed', 'unfinished_subtasks', 'blocking_count'].every(key => Number.isSafeInteger(v[key]) && Number(v[key]) >= 0) ||
    !Number.isSafeInteger(v.task_revision) || Number(v.task_revision) < 1 ||
    Number(v.subtasks_completed) > Number(v.subtasks_total) ||
    Number(v.unfinished_subtasks) !== Number(v.subtasks_total) - Number(v.subtasks_completed) ||
    !['subtasks', 'blocked_by', 'blocks'].every(key => Array.isArray(v[key]))) throw Error('Las relaciones de la tarea no son válidas.')
  return {
    ...v,
    parent: v.parent === null ? null : parseTaskRelationSummary(v.parent),
    subtasks: (v.subtasks as unknown[]).map(parseTaskRelationSummary),
    blocked_by: (v.blocked_by as unknown[]).map(parseTaskRelationSummary),
    blocks: (v.blocks as unknown[]).map(parseTaskRelationSummary),
  } as TaskRelations
}
