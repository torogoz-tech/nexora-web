import { apiFetch } from './apiFetch'
import type { GitAuthorAlias } from '../types/GitAuthorAlias'
export async function revokeGitAlias(alias: GitAuthorAlias, reason: string, key: string, signal: AbortSignal) {
 const response = await apiFetch(`/api/v1/members/${encodeURIComponent(alias.actor_id)}/git-aliases/${encodeURIComponent(alias.id)}/revoke`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify({ expected_revision: alias.revision, reason: reason.trim() }), signal })
 if (!response.ok) throw Error(response.status === 409 ? 'El alias cambió. Actualiza el listado antes de continuar.' : response.status === 403 || response.status === 404 ? 'No tienes permiso para administrar alias en este ámbito.' : 'No pudimos revocar el alias Git.')
}
