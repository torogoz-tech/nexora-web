import type { WorkflowState } from './WorkflowState'
export type WorkflowStateEditorProps = {
  state: WorkflowState
  disabled: boolean
  canDelete: boolean
  onChange: (patch: Partial<WorkflowState>) => void
  onDelete: () => void
}
