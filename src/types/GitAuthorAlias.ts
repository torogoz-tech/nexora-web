import type { GitProvider } from './GitProvider'
export type GitAuthorAlias = { id: string; actor_id: string; actor_name: string; provider: GitProvider; host: string; email: string; project_id: string | null; revision: number; revoked_at: string | null }
