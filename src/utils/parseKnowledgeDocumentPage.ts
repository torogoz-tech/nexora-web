import { requireRecord } from './requireRecord'
import { parseKnowledgeDocument } from './parseKnowledgeDocument'
import type { KnowledgeDocumentPage } from '../types/KnowledgeDocumentPage'
export function parseKnowledgeDocumentPage(
  value: unknown,
): KnowledgeDocumentPage {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.items) ||
    (v.next_after !== null && typeof v.next_after !== 'string')
  )
    throw new Error('El catálogo recibido no es válido.')
  return {
    items: v.items.map((value) => {
      const item = requireRecord(value)
      if (
        typeof item.latest_title !== 'string' ||
        typeof item.state_id !== 'string' ||
        (item.needs_review !== undefined &&
          typeof item.needs_review !== 'boolean')
      )
        throw new Error('El artículo recibido no es válido.')
      return {
        ...parseKnowledgeDocument(item),
        latest_title: item.latest_title,
        state_id: item.state_id,
        needs_review: item.needs_review === true,
      }
    }),
    next_after: v.next_after,
  }
}
