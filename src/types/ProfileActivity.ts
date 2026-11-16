import type { ProfileActivityAuthor } from './ProfileActivityAuthor'
export type ProfileActivity = { id: string; project_id: string; kind: 'task' | 'document' | 'commit'; title: string; created_at: string; repository_name?: string | null; repository_id?: string | null; commit_sha?: string | null; branches?: string[]; author?: ProfileActivityAuthor | null }
