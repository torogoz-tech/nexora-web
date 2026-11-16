import type { KnowledgeContribution } from './KnowledgeContribution'
export type KnowledgeContributionDetail = {
  contribution: KnowledgeContribution
  history: KnowledgeContribution[]
  next_offset: number | null
  history_total: number
}
