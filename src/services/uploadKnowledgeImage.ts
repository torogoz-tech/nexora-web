import { apiFetch } from './apiFetch'
import { requireRecord } from '../utils/requireRecord'
export async function uploadKnowledgeImage(
  file: File,
  projectId: string | null,
) {
  if (
    !['image/png', 'image/jpeg', 'image/webp'].includes(file.type) ||
    !file.size ||
    file.size > 4 * 1024 * 1024
  )
    throw Error('Usa una imagen PNG, JPEG o WebP de hasta 4 MB.')
  const bytes = new Uint8Array(await file.arrayBuffer())
  let binary = ''
  for (let i = 0; i < bytes.length; i += 8192)
    binary += String.fromCharCode(...bytes.subarray(i, i + 8192))
  const response = await apiFetch('/api/v1/knowledge/images', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': crypto.randomUUID(),
    },
    body: JSON.stringify({
      project_id: projectId,
      name: file.name || 'image.png',
      image_base64: btoa(binary),
    }),
  })
  if (!response.ok)
    throw Error(
      'No pudimos guardar la imagen. Vuelve a pegarla para reintentar.',
    )
  const value = requireRecord(await response.json())
  if (
    typeof value.id !== 'string' ||
    !/^kim_[a-zA-Z0-9_]+$/.test(value.id) ||
    value.url !== `/api/v1/knowledge/images/${value.id}/content`
  )
    throw Error('La respuesta de la evidencia no es válida.')
  return { url: String(value.url), name: file.name || 'Imagen' }
}
