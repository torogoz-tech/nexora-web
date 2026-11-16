import { requireRecord } from './requireRecord'
import type { KnowledgeDocument } from '../types/KnowledgeDocument'
export function parseKnowledgeDocument(value: unknown): KnowledgeDocument {
  const v = requireRecord(value)
  if (
    ![
      'id',
      'project_id',
      'code',
      'kind',
      'latest_version_id',
      'created_by',
      'created_at',
      'updated_at',
    ].every((key) => typeof v[key] === 'string') ||
    !['document', 'requirement', 'business_rule', 'decision', 'best_practice', 'technical_debt', 'security'].includes(
      String(v.kind),
    ) ||
    typeof v.archived !== 'boolean' ||
    !Number.isSafeInteger(v.latest_version_number) ||
    Number(v.latest_version_number) < 1 ||
    (v.published_version_id !== null &&
      typeof v.published_version_id !== 'string')
  )
    throw new Error('El documento recibido no es válido.')
  if(v.revision !== undefined && (!Number.isSafeInteger(v.revision) || Number(v.revision)<1)) throw Error('La revisión del artículo no es válida.')
  return {
    revision: v.revision === undefined ? undefined : Number(v.revision),
    id: String(v.id),
    project_id: String(v.project_id),
    code: String(v.code),
    kind: v.kind as KnowledgeDocument['kind'],
    archived: v.archived,
    latest_version_id: String(v.latest_version_id),
    latest_version_number: Number(v.latest_version_number),
    published_version_id: v.published_version_id as string | null,
    created_by: String(v.created_by),
    created_at: String(v.created_at),
    updated_at: String(v.updated_at),
  }
}
