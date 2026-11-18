import { parseBrowserSession } from '../utils/parseBrowserSession'
import { browserHeaders } from './browserHeaders'
import type { Session } from '../types/Session'

export async function startOidcLogin(
  providerId: string,
  signal: AbortSignal,
): Promise<Session> {
  const popup = window.open(
    'about:blank',
    '_blank',
    'popup,width=560,height=720',
  )
  if (!popup)
    throw new Error(
      'Permite las ventanas emergentes para iniciar sesión con tu organización.',
    )
  popup.opener = null
  try {
    const response = await fetch(
      `/api/v1/auth/oidc/providers/${encodeURIComponent(providerId)}/start`,
      {
        method: 'POST',
        headers: browserHeaders({ 'Content-Type': 'application/json', Accept: 'application/json' }),
        credentials: 'same-origin',
        body: '{}',
        signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]),
      },
    )
    if (!response.ok)
      throw new Error('No pudimos iniciar el acceso con tu organización.')
    const data: unknown = await response.json()
    if (
      typeof data !== 'object' ||
      data === null ||
      !('authorization_url' in data) ||
      typeof data.authorization_url !== 'string'
    )
      throw new Error('La respuesta del proveedor no es válida.')
    const url = new URL(data.authorization_url)
    if (
      url.protocol !== 'https:' &&
      !(
        url.protocol === 'http:' &&
        ['127.0.0.1', '[::1]'].includes(url.hostname)
      )
    )
      throw new Error('El proveedor no utiliza una dirección segura.')
    const expectedState = url.searchParams.get('state')
    if (!expectedState)
      throw new Error('El proveedor no devolvió un estado de autorización.')
    popup.location.href = url.href
    return await new Promise<Session>((resolve, reject) => {
      const deadline = Date.now() + 600000
      const stop = () => {
        window.clearInterval(interval)
        signal.removeEventListener('abort', cancel)
      }
      const fail = (message: string) => {
        stop()
        reject(new Error(message))
      }
      const cancel = () => fail('El inicio de sesión fue cancelado.')
      const interval = window.setInterval(() => {
        if (popup.closed) {
          fail('Cerraste la ventana antes de completar el inicio de sesión.')
          return
        }
        if (Date.now() > deadline) {
          fail('El inicio de sesión expiró. Vuelve a intentarlo.')
          return
        }
        let location: URL
        try {
          location = new URL(popup.location.href)
        } catch {
          return
        }
        if (
          location.origin !== window.location.origin ||
          location.pathname !== '/api/v1/auth/oidc/callback'
        )
          return
        if (
          popup.document.readyState !== 'complete' ||
          popup.document.URL !== location.href
        )
          return
        if (popup.document.querySelector('h1')?.textContent?.includes('No se pudo completar el acceso')) {
          fail('El proveedor no pudo completar el acceso. Inicia sesión de nuevo.')
          return
        }
        if (!popup.document.querySelector('pre')) return
        if (location.searchParams.get('state') !== expectedState) {
          fail('No pudimos verificar la respuesta de acceso.')
          return
        }
        try {
          const session = parseBrowserSession(
            JSON.parse(
              popup.document.querySelector('pre')?.textContent ??
                popup.document.body.textContent ??
                'null',
            ),
          )
          stop()
          resolve(session)
        } catch {
          fail(
            'El proveedor no pudo completar el acceso. Revisa la configuración de la cuenta y del callback.',
          )
        }
      }, 300)
      signal.addEventListener('abort', cancel, { once: true })
      if (signal.aborted) cancel()
    })
  } finally {
    popup.close()
  }
}
