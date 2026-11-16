import type { FeatureProposalResult } from './FeatureProposalResult'
import type { FeatureProposalLink } from './FeatureProposalLink'
export type FeatureProposal = {
  id: string
  requirement_title: string
  requirement_id: string
  requirement_version_id: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  proposed_by: string
  decided_by: string | null
  decision_reason: string | null
  created_at: string
  decided_at: string | null
  revision: number
  links: FeatureProposalLink[]
  tasks: Record<string, unknown>[]
  result: FeatureProposalResult | null
}
