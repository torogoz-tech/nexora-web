import type { TaskTransitionBranch } from '../types/TaskTransitionBranch'
import { apiFetch } from './apiFetch'
import type { TaskDetails } from '../types/TaskDetails'
export async function transitionPoolTask(task: TaskDetails, transitionId: string, reason: string, resolution: string, key: string, signal: AbortSignal, branches: TaskTransitionBranch[] = [], release?:{id:string;revision:number}) {
  const response = await apiFetch(`/api/v1/tasks/${encodeURIComponent(task.id)}/transitions/${encodeURIComponent(transitionId)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify({ expected_revision: task.revision, ...(release?{release_id:release.id,release_revision:release.revision}:{}), ...(branches.length ? {branches} : {}), ...(reason.trim() ? { reason: reason.trim() } : {}), ...(resolution.trim() ? { resolution: resolution.trim() } : {}) }), signal,
  })
  if (!response.ok) {
    if (response.status === 409) throw Error('La tarea cambió o falta una condición del workflow. Actualiza el detalle y revisa los requisitos.')
    if (response.status === 403) throw Error('No tienes permiso para avanzar esta tarea o falta una aprobación humana.')
    if (response.status === 422) throw Error('La transición requiere campos, evidencias o aprobaciones válidas. Revisa las condiciones del workflow.')
    throw Error('No pudimos avanzar la tarea. Revisa las condiciones del workflow.')
  }
}
