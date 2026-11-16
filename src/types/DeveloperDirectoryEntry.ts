import type {MemberRole} from './MemberRole'
import type {DeveloperWorkflowAssignment} from './DeveloperWorkflowAssignment'
export type DeveloperDirectoryEntry = {
  role?: MemberRole | null
  workflows?: DeveloperWorkflowAssignment[]
  id: string
  name: string
  workflow_id: string | null
  workflow_version_id: string | null
  assignment_revision: number
}
