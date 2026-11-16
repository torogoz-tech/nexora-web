import type { TaskRelations } from '../types/TaskRelations'
export function taskRelationRestrictions(relations: TaskRelations | null, revision: number) {
  const stale = relations !== null && relations.task_revision !== revision
  return {
    stale,
    take: !relations || stale || !relations.can_take || relations.blocking_count > 0,
    complete: !relations || stale || !relations.can_complete || relations.unfinished_subtasks > 0,
  }
}
