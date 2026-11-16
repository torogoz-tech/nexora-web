import { apiFetch } from './apiFetch'
export async function writeApiJson(
  path: string,
  payload: unknown,
  idempotencyKey: string,
  signal: AbortSignal,
): Promise<unknown> {
  const response = await apiFetch(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(payload),
    signal,
  })
  if (response.status === 401)
    throw new Error('La sesión terminó. Inicia sesión de nuevo.')
  if (response.status === 403)
    throw new Error('No tienes permisos para modificar estos vínculos.')
  if (response.status === 404)
    throw new Error(
      'El destino ya no está disponible o esta función no está habilitada en la API.',
    )
  if (response.status === 409)
    throw new Error(
      'El vínculo ya existe o el destino cambió. Actualiza los datos antes de volver a intentarlo.',
    )
  if (!response.ok)
    throw new Error(
      'No pudimos confirmar el cambio. Revisa los datos y vuelve a intentarlo.',
    )
  return response.json()
}
