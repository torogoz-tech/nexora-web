import { apiFetch } from './apiFetch'
export async function writeLaborCalendar(path: string, method: 'PUT' | 'POST', input: unknown, signal: AbortSignal, key: string) {
  const response = await apiFetch(path, { method, signal, headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify(input) })
  if (response.status === 403) throw Error('No tienes permiso para realizar esta acción.')
  if (response.status === 409) throw Error('El calendario cambió. Actualiza los datos y vuelve a intentarlo.')
  if (response.status === 422) throw Error('Revisa las fechas, la duración y el motivo.')
  if (!response.ok) throw Error('No pudimos guardar los cambios. Vuelve a intentarlo.')
  return response.json() as Promise<unknown>
}
