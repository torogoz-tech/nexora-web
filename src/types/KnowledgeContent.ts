import type { KnowledgeDocumentKind } from './KnowledgeDocumentKind'
export type KnowledgeContent = {
  kind: KnowledgeDocumentKind
  body: Record<string, unknown>
}
