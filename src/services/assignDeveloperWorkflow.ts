import { apiFetch } from './apiFetch'
import { parseDeveloperWorkflowAssignment } from '../utils/parseDeveloperWorkflowAssignment'
export async function assignDeveloperWorkflow(
  actor: string,
  version: string,
  revision: number,
  key: string,
  signal: AbortSignal,
) {
  const response = await apiFetch(
    `/api/v1/actors/${encodeURIComponent(actor)}/workflow`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body: JSON.stringify({
        expected_revision: revision,
        workflow_version_id: version,
      }),
      signal,
    },
  )
  if (!response.ok)
    throw Error(
      response.status === 409
        ? 'El desarrollador cambió de workflow o tiene tareas en otro. Actualiza la lista y reasigna esas tareas antes de cambiar su workflow.'
        : response.status === 403
          ? 'No tienes permisos para vincular desarrolladores.'
          : 'No pudimos vincular al desarrollador. Revisa la versión publicada y vuelve a intentarlo.',
    )
  const value = parseDeveloperWorkflowAssignment(await response.json())
  if (value.actor_id !== actor || value.workflow_version_id !== version)
    throw Error('La API devolvió otra vinculación de workflow.')
  return value
}
