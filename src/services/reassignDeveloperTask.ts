import { apiFetch } from './apiFetch'
import type { DeveloperBoardTask } from '../types/DeveloperBoardTask'
export async function reassignDeveloperTask(
  task: DeveloperBoardTask,
  actor: string,
  _version: string,
  _state: string | undefined,
  reason: string,
  key: string,
  signal: AbortSignal,
) {
  const response = await apiFetch(
    `/api/v1/tasks/${encodeURIComponent(task.id)}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body: JSON.stringify({
        expected_revision: task.revision,
        assignee_id: actor,
        reason: reason.trim(),
      }),
      signal,
    },
  )
  if (!response.ok)
    throw Error(
      response.status === 409
        ? 'La tarea o la vinculación cambió. Actualiza el tablero antes de intentarlo de nuevo.'
        : response.status === 403
          ? 'No tienes permisos para reasignar esta tarea.'
          : 'No pudimos reasignar la tarea. Selecciona un desarrollador y un estado válido de su workflow.',
    )
}
