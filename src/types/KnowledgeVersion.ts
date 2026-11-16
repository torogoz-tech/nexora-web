import type { KnowledgeContent } from './KnowledgeContent'
export type KnowledgeVersion = {
  state_revision?: number
  id: string
  document_id: string
  project_id: string
  number: number
  title: string
  content: KnowledgeContent
  origin: string
  state_id: string
  reason: string
  created_by: string
  created_at: string
  checksum: string
  needs_review: boolean
  evidence: {
    repository_id: string
    snapshot_id: string
    path: string
    start_line: number
    line_count: number
  }[]
}
