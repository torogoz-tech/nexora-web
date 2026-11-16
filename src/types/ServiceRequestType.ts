import type { WorkflowIcon } from './WorkflowIcon'
import type { RequestSlaPolicy } from './RequestSlaPolicy'
export type ServiceRequestType = {
  id: string
  name: string
  archived: boolean
  revision: number
  icon: WorkflowIcon
  color: string
  sla: Record<string, RequestSlaPolicy>
  total: number | null
}
