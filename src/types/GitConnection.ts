import type { GitProvider } from './GitProvider'
export type GitConnection = {
  id: string
  provider: GitProvider
  host: string
  owner_actor_id: string
  remote_login: string
  remote_account_id: string
  installation_id: string | null
  status: 'active' | 'revoked'
  revision: number
  expires_at: string
}
