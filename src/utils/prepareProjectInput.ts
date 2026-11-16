import type { CreateProjectInput } from '../types/CreateProjectInput'
export function prepareProjectInput(
  name: string,
  description: string,
): CreateProjectInput {
  const normalizedName = name.trim()
  const normalizedDescription = description.trim()
  const encoder = new TextEncoder()
  if (!normalizedName) throw new Error('Escribe el nombre del proyecto.')
  if (encoder.encode(normalizedName).length > 160)
    throw new Error(
      'El nombre es demasiado largo. Utiliza un nombre más corto.',
    )
  if (/\p{Cc}/u.test(normalizedName))
    throw new Error(
      'El nombre no puede contener saltos de línea ni caracteres de control.',
    )
  if (encoder.encode(normalizedDescription).length > 4000)
    throw new Error('La descripción es demasiado larga. Reduce su contenido.')
  if (/\p{Cc}/u.test(normalizedDescription.replace(/[\n\t]/g, '')))
    throw new Error('La descripción contiene caracteres no permitidos.')
  return { name: normalizedName, description: normalizedDescription || null }
}
