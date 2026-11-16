import type { KnowledgeDocumentKind } from './KnowledgeDocumentKind'
export type KnowledgeCatalogProps = {
  projectId: string
  kind: KnowledgeDocumentKind
  search: string
  title: string
  showHeading?: boolean
  descending?: boolean
}
