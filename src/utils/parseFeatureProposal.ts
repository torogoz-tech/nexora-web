import { parseFeatureCatalog } from './parseFeatureCatalog'
export function parseFeatureProposal(value: unknown) {
  return parseFeatureCatalog({catalog_revision:0,items:[],proposals:[value],links:[],can_decide:false}).proposals[0]!
}
