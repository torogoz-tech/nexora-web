import { apiFetch } from './apiFetch'
export async function uploadRequestAttachment(id: string, file: File, key: string = crypto.randomUUID()) {
  const response = await apiFetch(`/api/v1/requests/${encodeURIComponent(id)}/attachments?name=${encodeURIComponent(file.name)}`, { method: 'POST', headers: { 'Content-Type': 'application/octet-stream', 'Idempotency-Key': key }, body: file }, 60000)
  if (!response.ok) throw Error('No pudimos adjuntar el archivo. Usa imágenes, PDF, Office, TXT o CSV de hasta 20 MB.')
  return response.json() as Promise<{ id: string; url: string; name: string }>
}
