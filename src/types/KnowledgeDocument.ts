import type { KnowledgeDocumentKind } from './KnowledgeDocumentKind'
export type KnowledgeDocument = {
  revision?: number
  id: string
  project_id: string
  code: string
  kind: KnowledgeDocumentKind
  archived: boolean
  latest_version_id: string
  latest_version_number: number
  published_version_id: string | null
  created_by: string
  created_at: string
  updated_at: string
}
