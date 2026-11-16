import type { WorkflowGraph } from './WorkflowGraph'
import type { WorkflowResourceKind } from './WorkflowResourceKind'
import type { WorkflowIcon } from './WorkflowIcon'
export type WorkflowInput = {
  name: string
  icon?: WorkflowIcon
  color?: string
  purpose: string
  resource_kinds: WorkflowResourceKind[]
  graph: WorkflowGraph
}
