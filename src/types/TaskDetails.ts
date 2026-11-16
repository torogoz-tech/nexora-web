export type TaskDetails = {
  purpose?: import('./TaskPurpose').TaskPurpose
  entry_workflow_id?: string | null
  primary_requirement_id?: string | null
  primary_feature_id?: string | null
  id: string
  project_id: string | null
  lifecycle: import('./TaskLifecycle').TaskLifecycle
  workflow_id: string | null
  workflow_version_id: string | null
  state_id: string | null
  assignee_id: string | null
  title: string
  context: string
  acceptance_criteria?: string[]
  created_by: string
  timing?: import('./TaskTiming').TaskTiming
  assignee?: import('./TaskCreator').TaskCreator | null
  creator?: import('./TaskCreator').TaskCreator
  resolution?: string | null
  priority?: 'low' | 'medium' | 'high' | 'critical'
  blocked?: boolean
  archived?: boolean
  type_code?: string
  project_name?: string | null
  type_name?: string | null
  assignee_name?: string | null
  created_by_name?: string | null
  knowledge?: import('./TaskKnowledge').TaskKnowledge
  revision: number
}
