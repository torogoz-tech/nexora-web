import { requireRecord } from './requireRecord'
import type { GitConnection } from '../types/GitConnection'
export function parseGitConnection(value: unknown): GitConnection {
  const v = requireRecord(value)
  if (
    ![
      'id',
      'host',
      'owner_actor_id',
      'remote_login',
      'remote_account_id',
      'expires_at',
    ].every((k) => typeof v[k] === 'string') ||
    !['github', 'gitlab'].includes(String(v.provider)) ||
    !['active', 'revoked'].includes(String(v.status)) ||
    !Number.isSafeInteger(v.revision) ||
    Number(v.revision) < 1 ||
    (v.installation_id != null && typeof v.installation_id !== 'string')
  )
    throw new Error('La conexión Git no es válida.')
  return {
    id: String(v.id),
    host: String(v.host),
    owner_actor_id: String(v.owner_actor_id),
    remote_login: String(v.remote_login),
    remote_account_id: String(v.remote_account_id),
    expires_at: String(v.expires_at),
    provider: v.provider as GitConnection['provider'],
    status: v.status as GitConnection['status'],
    revision: Number(v.revision),
    installation_id:
      typeof v.installation_id === 'string' ? v.installation_id : null,
  }
}
