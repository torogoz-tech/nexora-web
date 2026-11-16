import type { AnalysisProfileSummary } from './AnalysisProfileSummary'
import type { AnalysisProfilePackage } from './AnalysisProfilePackage'
export type AnalysisProfileDetail = AnalysisProfileSummary & { package: AnalysisProfilePackage }
