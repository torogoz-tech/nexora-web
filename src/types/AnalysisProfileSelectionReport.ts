import type { AnalysisSkippedSource } from './AnalysisSkippedSource'
import type { AnalysisDecodedSource } from './AnalysisDecodedSource'
import type { AnalysisProfileUsage } from './AnalysisProfileUsage'
export type AnalysisProfileSelectionReport = { policy: string; status?: 'complete' | 'partial'; skipped_files?: AnalysisSkippedSource[]; decoded_files?: AnalysisDecodedSource[]; profiles: AnalysisProfileUsage[]; uncovered_files: string[]; excluded_files: string[]; excluded_directories?: string[] }
