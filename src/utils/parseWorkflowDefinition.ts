import { requireRecord } from './requireRecord'
import { parseWorkflowSummary } from './parseWorkflowSummary'
import { parseWorkflowGraph } from './parseWorkflowGraph'
import type { WorkflowDefinition } from '../types/WorkflowDefinition'
export function parseWorkflowDefinition(value: unknown): WorkflowDefinition {
  const v = requireRecord(value)
  return { ...parseWorkflowSummary(v), draft: parseWorkflowGraph(v.draft) }
}
