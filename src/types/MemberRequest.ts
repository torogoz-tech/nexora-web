import type { MemberRole } from './MemberRole'

export type MemberRequest = {
  id: string
  kind: 'identity' | 'invitation'
  name: string
  email: string
  created_at: string
  expires_at?: string
  status?: string
  role?: MemberRole | null
}
