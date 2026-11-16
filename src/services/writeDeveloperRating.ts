import { apiFetch } from './apiFetch'
export async function writeDeveloperRating(actorId: string, body: { project_id: string | null; score: number; reason: string; date: string; evidence_ids: string[] }, signal: AbortSignal, key: string) {
  const response = await apiFetch(`/api/v1/members/${encodeURIComponent(actorId)}/ratings`, { method: 'POST', signal, headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(body) })
  if (response.status === 403) throw Error('No tienes permiso para valorar este trabajo.')
  if (response.status === 409) throw Error('El registro cambió. Actualiza e inténtalo de nuevo.')
  if (response.status === 422) throw Error('Revisa la puntuación, el proyecto y el motivo.')
  if (!response.ok) throw Error('No pudimos registrar la valoración.')
}
