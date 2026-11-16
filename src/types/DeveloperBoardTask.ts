import type { TaskLifecycle } from './TaskLifecycle'
export type DeveloperBoardTask = {
  purpose?: import('./TaskPurpose').TaskPurpose
  entry_workflow_id?: string | null
  primary_requirement_id?: string | null
  primary_feature_id?: string | null
  lifecycle: TaskLifecycle
  id: string
  project_id: string | null
  project_name: string | null
  title: string
  assignee_id: string | null
  workflow_version_id: string | null
  state_id: string | null
  priority: 'low' | 'medium' | 'high' | 'critical'
  revision: number
  blocked: boolean
  blocking_count?: number
  subtasks_total?: number
  subtasks_completed?: number
}
