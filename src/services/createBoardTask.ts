import { apiFetch } from './apiFetch'
import { prepareBoardTaskInput } from '../utils/prepareBoardTaskInput'
import { requireRecord } from '../utils/requireRecord'
import type { BoardTaskInput } from '../types/BoardTaskInput'
export async function createBoardTask(
  input: BoardTaskInput,
  key: string,
  signal: AbortSignal,
) {
  const value = prepareBoardTaskInput(input)
  const response = await apiFetch(
    '/api/v1/tasks',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
      body: JSON.stringify({
        project_id: value.projectId,
        title: value.title,
        context: value.context, ...(value.acceptanceCriteria===undefined?{}:{acceptance_criteria:value.acceptanceCriteria}),
        type_code: value.typeCode,
        ...(value.entryWorkflowId?{entry_workflow_id:value.entryWorkflowId}:{}),
        ...(value.primaryRequirementId?{primary_requirement_id:value.primaryRequirementId}:{}),
        ...(value.primaryFeatureId?{primary_feature_id:value.primaryFeatureId}:{}),
        priority: value.priority,
        assignee_id: value.assigneeId,
        origin: 'web',
        fields: {},
      }),
      signal,
    },
  )
  if (!response.ok)
    throw new Error(
      response.status === 403
        ? 'No tienes permisos para crear tareas en este proyecto.'
        : response.status === 409
          ? 'El proyecto, el tipo o la asignación cambió. Actualiza los datos antes de intentarlo de nuevo.'
          : response.status === 422
            ? 'Revisa el tipo de tarea, el proyecto opcional y el responsable seleccionado.'
            : response.status === 401
              ? 'La sesión terminó. Inicia sesión de nuevo.'
              : 'No pudimos crear la tarea. Vuelve a intentarlo.',
    )
  const task = requireRecord(await response.json())
  if (
    typeof task.id !== 'string' ||
    !task.id ||
    task.project_id !== value.projectId ||
    task.lifecycle !== 'pending' ||
    task.workflow_id !== null ||
    task.workflow_version_id !== null ||
    task.state_id !== null ||
    task.assignee_id !== value.assigneeId ||
    task.type_code !== value.typeCode
  )
    throw new Error(
      'La respuesta no corresponde a la tarea solicitada. Actualiza el tablero para comprobar el resultado.',
    )
  return { id: task.id }
}
