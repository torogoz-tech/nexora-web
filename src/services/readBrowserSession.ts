import { browserHeaders } from './browserHeaders'
import { parseBrowserSession } from '../utils/parseBrowserSession'
export async function readBrowserSession(signal?: AbortSignal) {
  const check = () => fetch('/api/v1/auth/session', { headers: browserHeaders(), credentials: 'same-origin', cache: 'no-store', signal })
  let response = await check()
  if (!response.ok && response.status !== 401) throw Error('session-unavailable')
  // The shared cookie wins over any older tab's legacy credential.
  let legacy: string | null = null
  try { legacy = sessionStorage.getItem('nexora-session') ?? sessionStorage.getItem('nexora:access-challenge') } catch { /* Storage can be disabled. */ }
  if (response.status === 401 && legacy) {
    let token: unknown
    try { token = JSON.parse(legacy)?.accessToken } catch { /* Discard malformed legacy data. */ }
    if (typeof token === 'string' && token.startsWith('nxs_') && token.length <= 256) {
      response = await fetch('/api/v1/auth/session', { method: 'POST', credentials: 'same-origin', headers: browserHeaders({ Authorization: `Bearer ${token}` }), signal })
      if (!response.ok && response.status !== 401) throw Error('session-unavailable')
    }
  }
  try { sessionStorage.removeItem('nexora-session'); sessionStorage.removeItem('nexora:access-challenge') } catch { /* No credentials are persisted by this client. */ }
  if (response.status === 401) return null
  return parseBrowserSession(await response.json())
}
