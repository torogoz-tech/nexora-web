import type { MemberRole } from './MemberRole'
import type { MemberOidcProvider } from './MemberOidcProvider'
export type OrganizationMember = {
  id: string
  name: string
  username: string
  email: string
  active: boolean
  archived?: boolean
  lifecycle_revision?: number
  avatar_revision?: number
  has_password: boolean | null
  local_login_enabled: boolean | null
  oidc_providers: MemberOidcProvider[] | null
  last_login_at?: string | null
  created_at: string | null
  workflow_name: string | null
  position?: string
  position_revision?: number
  role?: MemberRole | null
  role_all_projects?: boolean
  role_project_ids?: string[]
  role_revision?: number
}
