import type { GitProvider } from './GitProvider'
export type GitAliasInput = { provider: GitProvider; host: string; email: string; project_id: string | null; reason?: string }
