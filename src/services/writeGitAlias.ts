import { apiFetch } from './apiFetch'
import type { GitAliasInput } from '../types/GitAliasInput'
export async function writeGitAlias(actorId: string, input: GitAliasInput, key: string, signal: AbortSignal) {
 const response = await apiFetch(`/api/v1/members/${encodeURIComponent(actorId)}/git-aliases`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(input), signal })
 if (!response.ok) throw Error(response.status === 409 ? 'Este alias ya está vinculado a otro miembro o cambió su configuración.' : response.status === 403 || response.status === 404 ? 'No tienes permiso para administrar alias en este ámbito.' : response.status === 422 ? 'Revisa el correo del autor, el host y el proyecto del alias.' : 'No pudimos guardar el alias Git.')
}
