import type { WorkflowGraph } from './WorkflowGraph'
export type WorkflowCanvasProps = {
  graph: WorkflowGraph
  selectedId: string
  onSelect: (id: string) => void
  readOnly?: boolean
  layoutKey?: string
  selectedTransitionId?: string
  onSelectTransition?: (id: string) => void
  onConnect?: (from: string, to: string) => void
  onEditState?: (id: string) => void
  onEditTransition?: (id: string) => void
}
