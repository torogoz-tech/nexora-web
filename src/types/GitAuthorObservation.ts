import type { GitProvider } from './GitProvider'
export type GitAuthorObservation = { id: string; provider: GitProvider; host: string; project_id: string; repository_id: string; commit_sha: string; author_name: string; author_email: string | null; actor_id: string | null; actor_name: string | null; alias_id: string | null; occurred_at: string }
