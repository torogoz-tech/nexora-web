import { requireRecord } from './requireRecord'
import type { KnowledgeContribution } from '../types/KnowledgeContribution'
export function parseKnowledgeContribution(
  value: unknown,
): KnowledgeContribution {
  const v = requireRecord(value),
    draft = requireRecord(v.draft)
  if (
    ![
      'id',
      'actor',
      'created_at',
      'state',
      'validity',
      'snapshot',
      'operation',
    ].every((key) => typeof v[key] === 'string') ||
    !Number.isSafeInteger(v.revision) ||
    Number(v.revision) < 1 ||
    typeof v.effective !== 'boolean' ||
    (v.effective === true &&
      (v.state !== 'accepted' || v.validity !== 'current')) ||
    !['proposed', 'accepted', 'rejected', 'withdrawn'].includes(
      String(v.state),
    ) ||
    !['current', 'needs_review'].includes(String(v.validity)) ||
    typeof draft.statement !== 'string' ||
    !['explanation', 'decision', 'relation'].includes(String(draft.kind)) ||
    !Array.isArray(draft.evidence) ||
    ['source', 'target', 'relation'].some(
      (key) => draft[key] != null && typeof draft[key] !== 'string',
    ) ||
    (v.reason !== undefined && typeof v.reason !== 'string')
  )
    throw new Error('El aporte técnico recibido no es válido.')
  const evidence = draft.evidence.map((value) => {
    const e = requireRecord(value)
    if (
      typeof e.path !== 'string' ||
      !Number.isSafeInteger(e.start_line) ||
      Number(e.start_line) < 1 ||
      !Number.isSafeInteger(e.line_count) ||
      Number(e.line_count) < 1
    )
      throw new Error('La referencia de código no es válida.')
    return {
      path: e.path,
      start_line: Number(e.start_line),
      line_count: Number(e.line_count),
    }
  })
  return {
    id: String(v.id),
    revision: Number(v.revision),
    actor: String(v.actor),
    created_at: String(v.created_at),
    state: String(v.state),
    validity: String(v.validity),
    effective: v.effective,
    snapshot: String(v.snapshot),
    operation: String(v.operation),
    reason: typeof v.reason === 'string' ? v.reason : '',
    draft: {
      kind: String(draft.kind),
      statement: draft.statement,
      source: typeof draft.source === 'string' ? draft.source : null,
      target: typeof draft.target === 'string' ? draft.target : null,
      relation: typeof draft.relation === 'string' ? draft.relation : null,
      evidence,
    },
  }
}
