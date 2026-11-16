import type { WorkflowStep } from '../types/WorkflowStep'
export function workflowStepOrderValid(steps: WorkflowStep[]) {
  const advances = steps.map((step, index) => step.kind === 'advance_state' ? index : -1).filter(index => index >= 0)
  if (advances.length !== 1) return false
  const boundary = advances[0]!
  return steps.every((step, index) => step.kind === 'advance_state' || ((step.kind === 'handoff'||step.kind==='publish_release') ? index > boundary && index===steps.length-1 : step.kind === 'notify' ? true : index < boundary)) && steps.filter(step => step.kind === 'require_approval').length <= 1
}
