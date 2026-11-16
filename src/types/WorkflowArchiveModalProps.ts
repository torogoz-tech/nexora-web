import type { WorkflowSummary } from './WorkflowSummary'
import type { WorkflowDefinition } from './WorkflowDefinition'
export type WorkflowArchiveModalProps = {
  workflow: WorkflowSummary
  onClose: () => void
  onChanged: (workflow: WorkflowDefinition) => void
}
