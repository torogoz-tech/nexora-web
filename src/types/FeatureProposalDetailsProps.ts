import type { FeatureProposal } from './FeatureProposal'
import type { ProjectFeature } from './ProjectFeature'
export type FeatureProposalDetailsProps = {
  projectId: string
  proposal: FeatureProposal
  features: ProjectFeature[]
  canDecide: boolean
  onClose: () => void
  onSaved: () => void
}
