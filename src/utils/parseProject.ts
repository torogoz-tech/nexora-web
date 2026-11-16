import type { Project } from '../types/Project'
export function parseProject(data: unknown): Project {
  if (
    typeof data !== 'object' ||
    data === null ||
    !('id' in data) ||
    typeof data.id !== 'string' ||
    !('name' in data) ||
    typeof data.name !== 'string' ||
    !('description' in data) ||
    (data.description !== null && typeof data.description !== 'string') ||
    !('archived' in data) ||
    typeof data.archived !== 'boolean' ||
    !('revision' in data) ||
    typeof data.revision !== 'number' ||
    !Number.isSafeInteger(data.revision) ||
    data.revision < 0
  )
    throw new Error(
      'La respuesta del proyecto no es válida. Actualiza la lista e inténtalo de nuevo.',
    )
  return data as Project
}
