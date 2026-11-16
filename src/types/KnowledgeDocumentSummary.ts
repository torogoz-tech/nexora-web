import type { KnowledgeDocument } from './KnowledgeDocument'
export type KnowledgeDocumentSummary = KnowledgeDocument & {
  latest_title: string
  state_id: string
  needs_review: boolean
}
