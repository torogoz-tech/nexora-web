import type { OvertimeTask } from './OvertimeTask'
import type { OvertimeCommit } from './OvertimeCommit'
export type OvertimeEvidence = { tasks: OvertimeTask[]; commits: OvertimeCommit[]; can_attach_evidence: boolean; evidence_unavailable?: boolean }
