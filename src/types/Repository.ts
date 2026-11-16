export type Repository = {
  remote_id?: string | null
  id: string
  project_id: string
  source_kind?: 'git' | 'local_snapshot'
  provider: 'github' | 'gitlab' | null
  host: string | null
  requested_full_name: string | null
  remote_full_name: string | null
  local_name?: string | null
  authorization_status: 'awaiting_authorization' | 'authorized' | 'revoked'
  archived: boolean
  revision: number
  latest_source_commit: string | null
}
