import type { KnowledgeContribution } from './KnowledgeContribution'
export type KnowledgeContributionPage = {
  items: KnowledgeContribution[]
  next_offset: number | null
  total: number
}
