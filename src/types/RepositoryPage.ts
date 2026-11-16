import type { Repository } from './Repository'
export type RepositoryPage = { items: Repository[]; next_cursor: string | null }
