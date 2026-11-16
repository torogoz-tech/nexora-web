import { requireRecord } from './requireRecord'
import { parseKnowledgeContent } from './parseKnowledgeContent'
import type { KnowledgeVersion } from '../types/KnowledgeVersion'
export function parseKnowledgeVersion(value: unknown): KnowledgeVersion {
  const v = requireRecord(value)
  if (
    ![
      'id',
      'document_id',
      'project_id',
      'title',
      'origin',
      'state_id',
      'reason',
      'created_by',
      'created_at',
      'checksum',
    ].every((key) => typeof v[key] === 'string') ||
    !Number.isSafeInteger(v.number) ||
    Number(v.number) < 1 ||
    !['observed_code', 'declared_business', 'agent_proposed'].includes(
      String(v.origin),
    ) ||
    (v.needs_review !== undefined && typeof v.needs_review !== 'boolean') ||
    (v.evidence !== undefined && !Array.isArray(v.evidence))
  )
    throw new Error('La versión del artículo no es válida.')
  const evidence = ((v.evidence ?? []) as unknown[]).map((value) => {
    const e = requireRecord(value)
    if (
      !['repository_id', 'snapshot_id', 'path'].every(
        (key) => typeof e[key] === 'string',
      ) ||
      !Number.isSafeInteger(e.start_line) ||
      Number(e.start_line) < 1 ||
      !Number.isSafeInteger(e.line_count) ||
      Number(e.line_count) < 1
    )
      throw new Error('La evidencia del artículo no es válida.')
    return {
      repository_id: String(e.repository_id),
      snapshot_id: String(e.snapshot_id),
      path: String(e.path),
      start_line: Number(e.start_line),
      line_count: Number(e.line_count),
    }
  })
  if(v.state_revision !== undefined && (!Number.isSafeInteger(v.state_revision) || Number(v.state_revision)<1)) throw Error('La revisión del artículo no es válida.')
  return {
    state_revision: v.state_revision === undefined ? undefined : Number(v.state_revision),
    id: String(v.id),
    document_id: String(v.document_id),
    project_id: String(v.project_id),
    number: Number(v.number),
    title: String(v.title),
    content: parseKnowledgeContent(v.content),
    origin: String(v.origin),
    state_id: String(v.state_id),
    reason: String(v.reason),
    created_by: String(v.created_by),
    created_at: String(v.created_at),
    checksum: String(v.checksum),
    needs_review: v.needs_review === true,
    evidence,
  }
}
