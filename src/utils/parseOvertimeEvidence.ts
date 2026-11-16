import type { OvertimeEvidence } from '../types/OvertimeEvidence'
export function parseOvertimeEvidence(value: unknown): OvertimeEvidence {
  const fail = () => { throw Error('Las evidencias de horas extras no son válidas.') }
  if (!value || typeof value !== 'object') return fail()
  const data = value as OvertimeEvidence
  if (!Array.isArray(data.tasks) || !Array.isArray(data.commits) || data.tasks.some(task => !task || typeof task.id !== 'string' || typeof task.project_id !== 'string' || typeof task.title !== 'string') || data.commits.some(commit => !commit || typeof commit.source_event_id !== 'string' || typeof commit.repository_id !== 'string' || typeof commit.repository_name !== 'string' || typeof commit.project_id !== 'string' || !/^[0-9a-f]{7,64}$/i.test(commit.sha) || typeof commit.occurred_at !== 'string' || Number.isNaN(Date.parse(commit.occurred_at)) || commit.provenance !== 'verified_push_receipt')) return fail()
  return { tasks: data.tasks, commits: data.commits, can_attach_evidence: data.can_attach_evidence === true, evidence_unavailable: data.evidence_unavailable === true }
}
