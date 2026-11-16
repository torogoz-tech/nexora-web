export type BoardTaskInput = {
  subtaskWork?: import('./SubtaskWork').SubtaskWork
  entryWorkflowId?: string | null
  primaryRequirementId?: string | null
  primaryFeatureId?: string | null
  projectId?: string | null
  workflowId?: string | null
  title: string
  context: string
  acceptanceCriteria?: string[]
  typeCode: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  assigneeId?: string | null
  workflowVersionId?: string | null
}
