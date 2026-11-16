import { requireRecord } from './requireRecord'
import type { Repository } from '../types/Repository'
export function parseRepository(value: unknown): Repository {
  const v = requireRecord(value)
  if (
    typeof v.id !== 'string' ||
    (v.remote_id !== undefined && v.remote_id !== null && typeof v.remote_id !== 'string') ||
    typeof v.project_id !== 'string' ||
    typeof v.archived !== 'boolean' ||
    !Number.isSafeInteger(v.revision) ||
    !['awaiting_authorization', 'authorized', 'revoked'].includes(
      String(v.authorization_status),
    ) ||
    ![null, 'github', 'gitlab'].includes(v.provider as string | null) ||
    ![undefined, 'git', 'local_snapshot'].includes(
      v.source_kind as string | undefined,
    ) ||
    ![
      'host',
      'requested_full_name',
      'remote_full_name',
      'latest_source_commit',
    ].every((key) => v[key] === null || typeof v[key] === 'string')
  )
    throw new Error('La información del repositorio no es válida.')
  return v as Repository
}
