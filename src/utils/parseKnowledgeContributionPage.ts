import { requireRecord } from './requireRecord'
import { parseKnowledgeContribution } from './parseKnowledgeContribution'
import type { KnowledgeContributionPage } from '../types/KnowledgeContributionPage'
export function parseKnowledgeContributionPage(
  value: unknown,
): KnowledgeContributionPage {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.items) ||
    !Number.isSafeInteger(v.total) ||
    Number(v.total) < 0 ||
    (v.next_offset !== null &&
      (!Number.isSafeInteger(v.next_offset) || Number(v.next_offset) < 0))
  )
    throw new Error('El catálogo técnico no es válido.')
  return {
    items: v.items.map(parseKnowledgeContribution),
    next_offset: v.next_offset as number | null,
    total: Number(v.total),
  }
}
