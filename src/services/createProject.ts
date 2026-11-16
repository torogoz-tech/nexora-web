import { parseProject } from '../utils/parseProject'
import { apiFetch } from './apiFetch'
import type { CreateProjectInput } from '../types/CreateProjectInput'
import type { Project } from '../types/Project'
export async function createProject(
  input: CreateProjectInput,
  idempotencyKey: string,
  signal: AbortSignal,
): Promise<Project> {
  const response = await apiFetch('/api/v1/projects', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(input),
    signal,
  })
  if (response.status === 401)
    throw new Error('La sesión terminó. Inicia sesión de nuevo.')
  if (response.status === 403)
    throw new Error('No tienes permisos para crear proyectos.')
  if (response.status === 409)
    throw new Error(
      'Ya existe un proyecto con ese nombre. Utiliza otro nombre.',
    )
  if (response.status === 400 || response.status === 422)
    throw new Error('Revisa el nombre y la descripción del proyecto.')
  if (!response.ok)
    throw new Error('No pudimos crear el proyecto. Vuelve a intentarlo.')
  return parseProject(await response.json())
}
