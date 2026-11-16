import { apiFetch } from './apiFetch'
import type { DeveloperWorkflowAssignment } from '../types/DeveloperWorkflowAssignment'
export async function removeDeveloperWorkflow(
  assignment: DeveloperWorkflowAssignment,
  reason: string,
  key: string,
  signal: AbortSignal,
) {
  const response = await apiFetch(
    `/api/v1/actors/${encodeURIComponent(assignment.actor_id)}/workflow`,
    {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body: JSON.stringify({
        expected_revision: assignment.revision,
        reason: reason.trim(),
      }),
      signal,
    },
  )
  if (!response.ok)
    throw Error(
      response.status === 409
        ? 'Primero archiva o reasigna sus tareas. Si ya lo hiciste, actualiza la lista de desarrolladores.'
        : response.status === 403
          ? 'No tienes permisos para desvincular desarrolladores.'
          : 'No pudimos confirmar la desvinculación. Actualiza la lista e inténtalo de nuevo.',
    )
}
