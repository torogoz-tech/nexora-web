import { apiFetch } from './apiFetch'
import { integrationError } from '../utils/integrationError'
import { requireRecord } from '../utils/requireRecord'
import { gitCallbackUrl } from '../utils/gitCallbackUrl'
import type { GitProvider } from '../types/GitProvider'
export async function startGitConnection(
  provider: GitProvider,
  signal: AbortSignal,
): Promise<unknown> {
  const popup = window.open(
    'about:blank',
    '_blank',
    'popup,width=600,height=740',
  )
  if (!popup)
    throw new Error('Permite las ventanas emergentes para conectar la cuenta.')
  popup.opener = null
  try {
    const response = await apiFetch(`/api/v1/git/${provider}/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal,
    })
    if (!response.ok) throw integrationError(response.status)
    const flow = requireRecord(await response.json())
    if (
      typeof flow.authorization_url !== 'string' ||
      typeof flow.state_id !== 'string'
    )
      throw new Error('El proveedor no devolvió una autorización válida.')
    const url = new URL(flow.authorization_url)
    if (
      url.protocol !== 'https:' &&
      !(
        url.protocol === 'http:' &&
        ['127.0.0.1', '[::1]'].includes(url.hostname)
      )
    )
      throw new Error('El proveedor requiere una dirección segura.')
    if (url.username || url.password)
      throw new Error('La dirección del proveedor no es válida.')
    gitCallbackUrl(
      url.searchParams.get('redirect_uri') ?? '',
      provider,
      window.location.origin,
    )
    const state = url.searchParams.get('state')
    if (!state || !state.startsWith(flow.state_id + '.'))
      throw new Error('No pudimos verificar el estado de autorización.')
    popup.location.href = url.href
    return await new Promise((resolve, reject) => {
      const deadline = Date.now() + 600000
      const stop = () => {
        window.clearInterval(interval)
        signal.removeEventListener('abort', cancel)
      }
      const fail = (message: string) => {
        stop()
        reject(new Error(message))
      }
      const cancel = () => fail('La conexión fue cancelada.')
      const interval = window.setInterval(() => {
        if (popup.closed)
          return fail('Cerraste la ventana antes de completar la conexión.')
        if (Date.now() > deadline)
          return fail('La autorización expiró. Vuelve a conectar la cuenta.')
        let location: URL
        try {
          location = new URL(popup.location.href)
        } catch {
          return
        }
        if (
          location.origin !== window.location.origin ||
          location.pathname !== `/api/v1/git/${provider}/callback`
        )
          return
        if (
          popup.document.readyState !== 'complete' ||
          popup.document.URL !== location.href ||
          !popup.document.querySelector('pre')
        )
          return
        if (location.searchParams.get('state') !== state)
          return fail('No pudimos verificar la respuesta del proveedor.')
        try {
          const value = JSON.parse(
            popup.document.querySelector('pre')?.textContent ?? 'null',
          )
          if (value?.code || location.searchParams.has('error'))
            return fail(
              'El proveedor no completó la conexión. Revisa los permisos y vuelve a intentarlo.',
            )
          stop()
          resolve(value)
        } catch {
          fail('La respuesta del proveedor no es válida.')
        }
      }, 300)
      signal.addEventListener('abort', cancel, { once: true })
      if (signal.aborted) cancel()
    })
  } finally {
    popup.close()
  }
}
