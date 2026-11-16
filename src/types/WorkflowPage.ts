import type { WorkflowSummary } from './WorkflowSummary'
export type WorkflowPage = {
  items: WorkflowSummary[]
  next_after: string | null
}
