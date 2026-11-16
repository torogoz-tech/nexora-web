import type { WorkflowState } from './WorkflowState'
import type { WorkflowTransition } from './WorkflowTransition'
export type WorkflowGraph = {
  states: WorkflowState[]
  transitions: WorkflowTransition[]
}
