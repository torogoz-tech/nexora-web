import { apiFetch } from './apiFetch'
import { integrationError } from '../utils/integrationError'
export async function integrationRequest(
  path: string,
  method: 'POST' | 'PATCH' | 'DELETE',
  payload: unknown,
  key: string,
  signal: AbortSignal,
): Promise<unknown> {
  const response = await apiFetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
    ...(payload !== undefined ? { body: JSON.stringify(payload) } : {}),
    signal,
  })
  if (!response.ok) throw integrationError(response.status)
  return response.status === 204 ? null : response.json()
}
