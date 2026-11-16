import { requireRecord } from './requireRecord'
import { parseWorkflowVersionSummary } from './parseWorkflowVersionSummary'
import { parseWorkflowGraph } from './parseWorkflowGraph'
import { workflowResourceOptions } from '../app/workflowResourceOptions'
import type { WorkflowVersion } from '../types/WorkflowVersion'
export function parseWorkflowVersion(value: unknown): WorkflowVersion {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.resource_kinds) ||
    !v.resource_kinds.length ||
    v.resource_kinds.some(
      (kind) =>
        !workflowResourceOptions.some((option) => option.value === kind),
    )
  )
    throw new Error('Los recursos de la versión no son válidos.')
  return {
    ...parseWorkflowVersionSummary(v),
    resource_kinds: v.resource_kinds as WorkflowVersion['resource_kinds'],
    graph: parseWorkflowGraph(v.graph),
  }
}
