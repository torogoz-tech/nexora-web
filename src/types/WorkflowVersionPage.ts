import type { WorkflowVersionSummary } from './WorkflowVersionSummary'
export type WorkflowVersionPage = {
  items: WorkflowVersionSummary[]
  next_before: number | null
}
