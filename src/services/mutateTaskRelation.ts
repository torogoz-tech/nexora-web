import { apiFetch } from './apiFetch'
import type { TaskRelationSummary } from '../types/TaskRelationSummary'
import type { TaskRelationOperation } from '../types/TaskRelationOperation'
export async function mutateTaskRelation(taskId: string, revision: number, target: TaskRelationSummary, operation: TaskRelationOperation, key: string, signal: AbortSignal) {
  const base = `/api/v1/tasks/${encodeURIComponent(taskId)}`
  if (operation === 'remove_dependency' && (!target.relation_id || !target.relation_revision)) throw Error('La relación cambió. Actualiza el detalle antes de continuar.')
  const path = operation === 'subtask' || operation === 'detach'
    ? `${base}/subtasks/${encodeURIComponent(target.id)}${operation === 'detach' ? '/remove' : ''}`
    : operation === 'prerequisite' ? `${base}/dependencies` : `${base}/dependencies/${encodeURIComponent(target.relation_id!)}/remove`
  const body = operation === 'subtask' || operation === 'detach'
    ? { expected_revision: revision, child_revision: target.revision, reason: operation === 'subtask' ? 'Subtarea vinculada desde la web.' : 'Relación de subtarea retirada desde la web.' }
    : operation === 'prerequisite'
      ? { source_task_id: taskId, target_task_id: target.id, kind: 'depends_on', source_revision: revision, target_revision: target.revision, reason: 'Requisito previo vinculado desde la web.' }
      : { expected_revision: target.relation_revision, reason: 'Requisito previo retirado desde la web.' }
  const response = await apiFetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(body), signal })
  if (!response.ok) throw Error(response.status === 409 ? 'La tarea o la relación cambió. Actualiza el detalle antes de continuar.' : response.status === 403 || response.status === 404 ? 'No tienes permiso para vincular estas tareas o ya no están disponibles.' : response.status === 422 ? 'No se puede crear esta relación. Revisa el proyecto, la jerarquía y las dependencias circulares.' : 'No pudimos actualizar las relaciones de la tarea.')
}
