import type { WorkflowGuard } from './WorkflowGuard'
export type WorkflowGuardEditorProps = {
  guards: WorkflowGuard[]
  onChange: (guards: WorkflowGuard[]) => void
  disabled: boolean
  taskOnly: boolean
  hasApprovalStep?: boolean
}
