import { parseBrowserSession } from '../utils/parseBrowserSession'
import { browserHeaders } from './browserHeaders'
import { decodeBase64Url, serializePasskeyAuthentication } from '../utils/passkeyResponse'

export async function gatePasskey(signal: AbortSignal) {
  const start = await fetch('/api/v1/auth/gate/passkey', { method: 'POST', signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]), headers: browserHeaders({ Accept: 'application/json' }), credentials: 'same-origin' })
  if (!start.ok) throw new Error('No pudimos iniciar la autenticación con Passkey.')
  const challenge = await start.json() as { ceremony_id: string; challenge: Record<string, unknown> }
  const wire = challenge.challenge as Record<string, any>
  const publicKey = { ...wire, challenge: decodeBase64Url(String(wire.challenge)), allowCredentials: Array.isArray(wire.allowCredentials) ? wire.allowCredentials.map(item => ({ ...item, id: decodeBase64Url(String(item.id)) })) : undefined } as PublicKeyCredentialRequestOptions
  const credential = await navigator.credentials.get({ publicKey })
  if (!(credential instanceof PublicKeyCredential)) throw new Error('El navegador no devolvió una Passkey válida.')
  const finish = await fetch(`/api/v1/auth/gate/passkey/${encodeURIComponent(challenge.ceremony_id)}`, { method: 'POST', signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]), headers: browserHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }), credentials: 'same-origin', body: JSON.stringify({ response: serializePasskeyAuthentication(credential) }) })
  if (!finish.ok) throw new Error('No pudimos validar la Passkey.')
  return parseBrowserSession(await finish.json())
}
