import type { WorkflowDefinition } from './WorkflowDefinition'
export type WorkflowEditorProps = {
  workflow: WorkflowDefinition | null
  focus?: { kind: 'state' | 'transition'; id: string }
  onReload: () => void
}
