import type { GitProvider } from './GitProvider'
export type RemoteRepository = { provider: GitProvider; remote_id: string; full_name: string }
