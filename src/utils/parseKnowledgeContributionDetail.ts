import { requireRecord } from './requireRecord'
import { parseKnowledgeContribution } from './parseKnowledgeContribution'
import type { KnowledgeContributionDetail } from '../types/KnowledgeContributionDetail'
export function parseKnowledgeContributionDetail(
  value: unknown,
): KnowledgeContributionDetail {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.history) ||
    !Number.isSafeInteger(v.history_total) ||
    Number(v.history_total) < 1 ||
    (v.next_offset !== null &&
      (!Number.isSafeInteger(v.next_offset) || Number(v.next_offset) < 0))
  )
    throw new Error('El historial de revisión no es válido.')
  return {
    contribution: parseKnowledgeContribution(v.contribution),
    history: v.history.map(parseKnowledgeContribution),
    next_offset: v.next_offset as number | null,
    history_total: Number(v.history_total),
  }
}
