import { apiFetch } from './apiFetch'
import type { DeveloperBoardTask } from '../types/DeveloperBoardTask'
export async function mutatePoolTask(task: DeveloperBoardTask, operation: 'reserve' | 'take' | 'assign' | 'pause' | 'resume' | 'archive' | 'complete-general', actorId: string | null, key: string, signal: AbortSignal, reason?: string, workflowId?: string, repositoryIds?: string[]) {
  const assignmentReason = reason?.trim() || (operation === 'reserve' ? 'Responsabilidad asumida sin iniciar ejecución.' : actorId ? 'Responsable de la tarea actualizado.' : 'Responsable de la tarea retirado.')
  const execution = operation === 'take' || operation === 'pause' || operation === 'resume' || operation === 'complete-general'
  const response = await apiFetch(`/api/v1/tasks/${encodeURIComponent(task.id)}${execution ? `/${operation}` : ''}`, {
    method: execution ? 'POST' : 'PATCH',
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify({ expected_revision: task.revision, ...(execution ? (operation === 'take' ? { ...(workflowId ? { workflow_id: workflowId } : {}), ...(repositoryIds?.length ? { repository_ids: repositoryIds } : {}) } : {}) : operation === 'archive' ? {archived:true, reason:'Tarea archivada.'} : { reason: assignmentReason, ...(actorId ? { assignee_id: actorId } : { clear_assignee: true }) }) }), signal,
  })
  if (!response.ok) {
    if (response.status === 409) {
      throw Error('La tarea cambió. Actualiza las tareas antes de intentarlo de nuevo.')
    }
    if (response.status === 403) throw Error('No tienes permisos para esta acción sobre la tarea.')
    if (response.status === 422 && (operation === 'pause' || operation === 'resume' || operation === 'archive')) throw Error('No pudimos cambiar la ejecución de la tarea. Revisa su estado, responsable y dependencias.')
    if (response.status === 422) throw Error(operation === 'take' ? 'No pudimos tomar la tarea. Confirma tu workflow publicado y la reserva del responsable.' : 'No pudimos cambiar el responsable. Revisa la persona seleccionada y el motivo de la asignación.')
    throw Error('No pudimos confirmar el cambio de la tarea. Vuelve a intentarlo.')
  }
}
