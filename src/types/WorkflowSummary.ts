import type { WorkflowResourceKind } from './WorkflowResourceKind'
import type { WorkflowIcon } from './WorkflowIcon'
export type WorkflowSummary = {
  id: string
  name: string
  icon?: WorkflowIcon
  color?: string
  purpose: string
  resource_kinds: WorkflowResourceKind[]
  archived: boolean
  revision: number
  latest_version_id: string | null
  latest_version_number: number
}
