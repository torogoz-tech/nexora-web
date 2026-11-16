import { getSession } from './getSession'
import { browserHeaders } from './browserHeaders'
export async function apiFetch(path: string, init: RequestInit = {}, timeoutMs = 15000) {
  if (!path.startsWith('/api/') || path.includes('://') || path.includes('\\'))
    throw new Error('invalid-api-path')
  const session = getSession()
  const headers = browserHeaders(init.headers)
  headers.set('Accept', 'application/json')
  const response = await fetch(path, {
    ...init,
    headers,
    credentials: 'same-origin',
    signal: init.signal
      ? AbortSignal.any([init.signal, AbortSignal.timeout(timeoutMs)])
      : AbortSignal.timeout(timeoutMs),
  })
  if (response.status === 401 && session)
    window.dispatchEvent(
      new CustomEvent('nexora:unauthorized', { detail: session.sessionId }),
    )
  return response
}
