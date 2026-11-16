import { apiFetch } from './apiFetch'
import { parseProject } from '../utils/parseProject'
import type { ProjectChange } from '../types/ProjectChange'
export async function updateProject(
  id: string,
  change: ProjectChange,
  idempotencyKey: string,
  signal: AbortSignal,
) {
  const response = await apiFetch(
    `/api/v1/projects/${encodeURIComponent(id)}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
      body: JSON.stringify(change),
      signal,
    },
  )
  if (response.status === 401)
    throw new Error('La sesión terminó. Inicia sesión de nuevo.')
  if (response.status === 403)
    throw new Error('No tienes permisos para modificar este proyecto.')
  if (response.status === 404)
    throw new Error('El proyecto ya no está disponible.')
  if (response.status === 409)
    throw new Error(
      'El proyecto cambió o el nombre ya está en uso. Cierra este formulario, actualiza la lista y vuelve a intentarlo.',
    )
  if (response.status === 400 || response.status === 422)
    throw new Error('Revisa el nombre y la descripción del proyecto.')
  if (!response.ok)
    throw new Error('No pudimos guardar el proyecto. Vuelve a intentarlo.')
  return parseProject(await response.json())
}
