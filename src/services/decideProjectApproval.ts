import { apiFetch } from './apiFetch'
export async function decideProjectApproval(path: string, input: unknown, signal: AbortSignal, key: string) {
  const response = await apiFetch(path, { method: 'POST', signal, headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(input) })
  if (response.status === 401) throw Error('La sesión terminó. Inicia sesión de nuevo.')
  if (response.status === 403) throw Error('No tienes permiso para realizar esta acción.')
  if (response.status === 409 || response.status === 404) throw Error('La solicitud cambió. Actualiza la bandeja antes de decidir.')
  if (response.status === 422) throw Error('Revisa el motivo de la decisión.')
  if (!response.ok) throw Error('No pudimos guardar los cambios. Vuelve a intentarlo.')
}
