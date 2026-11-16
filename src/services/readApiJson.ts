import { ApiReadError } from '../types/ApiReadError'
import { apiFetch } from './apiFetch'
export async function readApiJson(
  path: string,
  signal: AbortSignal,
): Promise<unknown> {
  const response = await apiFetch(path, { signal })
  if (response.status === 401)
    throw new Error('La sesión terminó. Inicia sesión de nuevo.')
  if (response.status === 403)
    throw new Error('No tienes permisos para consultar estos datos.')
  if (response.status === 404 && (path === '/api/v1/settings/email-template' || path.startsWith('/api/v1/settings/email-contents')))
    throw new Error('La API todavía no tiene disponible Email Template. Es necesario desplegar su actualización.')
  if (response.status === 404)
    throw new Error(
      'El recurso no está disponible o esta función no está habilitada en la API.',
    )
  if (response.status === 409)
    throw new Error(
      'El recurso cambió o requiere autorización. Actualiza los datos antes de volver a intentarlo.',
    )
  if (!response.ok)
    throw new ApiReadError('No pudimos consultar los datos. Vuelve a intentarlo.', response.status)
  return response.json()
}
