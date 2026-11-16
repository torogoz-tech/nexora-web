import { apiFetch } from './apiFetch'
export async function mutateWorkflow(
  path: string,
  method: 'POST' | 'PATCH',
  payload: unknown,
  key: string,
  signal: AbortSignal,
): Promise<unknown> {
  const response = await apiFetch(path, {
    method,
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
    signal,
  })
  if (!response.ok) {
    const messages: Record<number, string> = {
      401: 'La sesión terminó. Inicia sesión de nuevo.',
      403: 'No tienes permisos para realizar esta acción sobre workflows.',
      404: 'El workflow ya no está disponible.',
      409: 'El workflow cambió en otra sesión. Recarga su versión actual antes de volver a guardar o publicar.',
      422: 'La API rechazó el workflow. Revisa sus estados, transiciones, condiciones y motivo.',
    }
    throw new Error(
      messages[response.status] ??
        'No pudimos confirmar el cambio del workflow. Vuelve a intentarlo.',
    )
  }
  return response.json()
}
