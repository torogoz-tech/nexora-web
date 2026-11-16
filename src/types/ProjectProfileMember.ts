import type { MemberRole } from './MemberRole'
export type ProjectProfileMember = {
  id: string
  name: string
  username: string
  position: string
  role: MemberRole | null
  avatar_revision: number
}
