import type { OvertimeEvidence } from './OvertimeEvidence'
export type OvertimeEvidencePickerProps = { data: OvertimeEvidence; taskIds: string[]; commitIds?: string[]; busy: boolean; onTasks: (ids: string[]) => void; onCommits?: (ids: string[]) => void }
