import type { TaskLifecycle } from './TaskLifecycle'
export type TaskRelationSummary = {
  work_kind?: 'decomposition'|'corrective'
  tested_commit_sha?:string|null
  tested_repository_id?:string|null
  stage_completed?:boolean
  stage_workflow_version_id?:string|null
  id: string
  title: string
  lifecycle: TaskLifecycle
  project_id: string | null
  assignee_id: string | null
  revision: number
  relation_id: string | null
  relation_revision: number | null
}
