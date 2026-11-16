import { apiFetch } from './apiFetch'
import { prepareBoardTaskInput } from '../utils/prepareBoardTaskInput'
import { requireRecord } from '../utils/requireRecord'
import type { BoardTaskInput } from '../types/BoardTaskInput'
export async function createSubtask(parent: { id: string; revision: number; project_id: string | null }, input: BoardTaskInput, key: string, signal: AbortSignal) {
  const value = prepareBoardTaskInput({ ...input, projectId: parent.project_id })
  const response = await apiFetch(`/api/v1/tasks/${encodeURIComponent(parent.id)}/subtasks`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, signal,
    body: JSON.stringify({ expected_revision: parent.revision, ...(value.subtaskWork?{work_kind:value.subtaskWork.workKind,...(value.subtaskWork.testedRepositoryId?{tested_repository_id:value.subtaskWork.testedRepositoryId}:{}),...(value.subtaskWork.testedCommitSha?{tested_commit_sha:value.subtaskWork.testedCommitSha}:{})}:{}), definition: { title: value.title, context: value.context, ...(value.acceptanceCriteria===undefined?{}:{acceptance_criteria:value.acceptanceCriteria}), type_code: value.typeCode, ...(value.entryWorkflowId?{entry_workflow_id:value.entryWorkflowId}:{}),...(value.primaryRequirementId?{primary_requirement_id:value.primaryRequirementId}:{}),...(value.primaryFeatureId?{primary_feature_id:value.primaryFeatureId}:{}), priority: value.priority, assignee_id: value.assigneeId, origin: 'web', fields: {} } }),
  })
  if (!response.ok) throw Error(response.status === 409 ? 'La tarea principal cambió. Actualiza el detalle antes de crear la subtarea.' : response.status === 403 || response.status === 404 ? 'No tienes permiso para agregar subtareas a esta tarea.' : response.status === 422 ? 'Revisa el tipo, el responsable y el estado de la tarea principal.' : 'No pudimos crear la subtarea.')
  const task = requireRecord(await response.json())
  if (typeof task.id !== 'string' || !task.id || task.project_id !== parent.project_id || task.lifecycle !== 'pending' || task.workflow_id !== null || task.workflow_version_id !== null || task.state_id !== null || task.assignee_id !== value.assigneeId || task.type_code !== value.typeCode) throw Error('La respuesta no corresponde a la subtarea solicitada. Actualiza el detalle para comprobar el resultado.')
  return { id: task.id }
}
