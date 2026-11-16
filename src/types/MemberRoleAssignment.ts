import type { MemberRole } from './MemberRole'
export type MemberRoleAssignment = {
  role: MemberRole | null
  all_projects: boolean
  project_ids: string[]
  revision: number
}
