import { apiFetch } from './apiFetch'
export async function writeServiceRequest(path: string, value: unknown, key: string = crypto.randomUUID()) {
  const response = await apiFetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(value) })
  if (response.status === 409) throw Error('La solicitud cambió. Actualiza los datos antes de continuar.')
  if (response.status === 403) throw Error('No tienes permiso para realizar esta acción.')
  if (!response.ok) throw Error('No pudimos guardar la solicitud. Revisa los datos e inténtalo de nuevo.')
  return response.json() as Promise<unknown>
}
