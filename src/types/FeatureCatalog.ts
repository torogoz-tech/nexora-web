import type { ProjectFeature } from './ProjectFeature'
import type { FeatureProposal } from './FeatureProposal'
import type { RequirementFeatureLink } from './RequirementFeatureLink'
export type FeatureCatalog = {
  items: ProjectFeature[]
  proposals: FeatureProposal[]
  links: RequirementFeatureLink[]
  can_decide: boolean
  can_complete?: boolean
  catalog_revision: number
}
