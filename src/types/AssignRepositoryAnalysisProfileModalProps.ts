import type { AnalysisProfileAssignment } from './AnalysisProfileAssignment'
export type AssignRepositoryAnalysisProfileModalProps = { projectId: string; repositoryId: string; assignment: AnalysisProfileAssignment; onClose: () => void; onSaved: () => void }
