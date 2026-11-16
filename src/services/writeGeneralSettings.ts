import { readGeneralSettingsResponse } from './readGeneralSettingsResponse'
import { apiFetch } from './apiFetch'
export async function writeGeneralSettings(
  path: string,
  method: string,
  input: unknown,
  signal: AbortSignal,
  key: string,
) {
  const response = await apiFetch(path, {
    method,
    signal,
    headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
    body: JSON.stringify(input),
  })
  return readGeneralSettingsResponse(response, path)
}
