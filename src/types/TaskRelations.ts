import type { TaskRelationSummary } from './TaskRelationSummary'
export type TaskRelations = {
  task_revision: number
  parent: TaskRelationSummary | null
  subtasks: TaskRelationSummary[]
  blocked_by: TaskRelationSummary[]
  blocks: TaskRelationSummary[]
  can_manage: boolean
  can_take: boolean
  can_complete: boolean
  subtasks_total: number
  subtasks_completed: number
  unfinished_subtasks: number
  blocking_count: number
}
