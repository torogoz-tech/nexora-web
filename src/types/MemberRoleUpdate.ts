import type { MemberRole } from './MemberRole'
export type MemberRoleUpdate = {
  role: Exclude<MemberRole, 'super_admin'>
  all_projects: boolean
  project_ids: string[]
  expected_revision: number
}
