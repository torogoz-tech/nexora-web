import type { KnowledgeDocumentSummary } from './KnowledgeDocumentSummary'
export type KnowledgeDocumentPage = {
  items: KnowledgeDocumentSummary[]
  next_after: string | null
}
