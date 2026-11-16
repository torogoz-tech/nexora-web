import type { WorkflowSummary } from './WorkflowSummary'
import type { WorkflowGraph } from './WorkflowGraph'
export type WorkflowDefinition = WorkflowSummary & { draft: WorkflowGraph }
