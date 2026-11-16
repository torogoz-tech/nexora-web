import type { WorkflowStep } from './WorkflowStep'
import type { WorkflowGuard } from './WorkflowGuard'
export type WorkflowTransition = {
  automatic?: boolean
  id: string
  name: string
  from: string
  to: string
  guards: WorkflowGuard[]
  steps?: WorkflowStep[]
}
