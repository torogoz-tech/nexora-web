import { apiFetch } from './apiFetch'
export async function decideFeatureProposal(projectId: string, proposalId: string, expectedRevision: number, decision: 'approved' | 'rejected', reason: string, key: string, signal: AbortSignal): Promise<void> {
  const response = await apiFetch(`/api/v1/projects/${encodeURIComponent(projectId)}/feature-proposals/${encodeURIComponent(proposalId)}/decision`, {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify({ expected_revision: expectedRevision, decision, reason: reason.trim() }),
  })
  if (response.status === 401) throw new Error('La sesión terminó. Inicia sesión de nuevo.')
  if (response.status === 403) throw new Error('No tienes permisos para decidir esta propuesta.')
  if (response.status === 409) throw new Error('La propuesta cambió. Actualiza los datos antes de volver a decidir.')
  if (!response.ok) throw new Error('No pudimos confirmar la decisión. Revisa los datos y vuelve a intentarlo.')
}
