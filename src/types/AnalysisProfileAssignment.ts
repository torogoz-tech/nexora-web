import type { AnalysisProfileSummary } from './AnalysisProfileSummary'
import type { AnalysisProfileSelectionReport } from './AnalysisProfileSelectionReport'
export type AnalysisProfileAssignment = { repository_id: string; last_source_commit?:string; revision: number; profile: AnalysisProfileSummary | null; can_manage: boolean; mode: 'automatic' | 'manual' | 'legacy'; profiles: AnalysisProfileSummary[]; last_selection: AnalysisProfileSelectionReport | null }
