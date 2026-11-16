import type { WorkflowGraph } from './WorkflowGraph'
export type WorkflowTransitionEditorProps = {
  selectedId: string
  graph: WorkflowGraph
  disabled: boolean
  taskOnly: boolean
  onChange: (graph: WorkflowGraph) => void
}
