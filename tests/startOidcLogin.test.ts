import { afterEach, describe, expect, it, vi } from 'vitest'
import { startOidcLogin } from '../src/services/startOidcLogin'

describe('startOidcLogin', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('shows a useful error when the callback page reports an expired login', async () => {
    vi.useFakeTimers()

    let popupUrl = 'about:blank'
    const popup = {
      closed: false,
      opener: null,
      location: {
        get href() {
          return popupUrl
        },
        set href(value: string) {
          popupUrl = value
        },
      },
      document: {
        readyState: 'complete',
        get URL() {
          return popupUrl
        },
        querySelector: (selector: string) =>
          selector === 'h1' && popupUrl.includes('/api/v1/auth/oidc/callback')
            ? { textContent: 'No se pudo completar el acceso' }
            : null,
        body: { textContent: '' },
      },
      close: vi.fn(),
    }

    vi.stubGlobal('window', {
      location: { origin: 'https://nexora.example' },
      open: vi.fn(() => popup),
      setInterval: globalThis.setInterval,
      clearInterval: globalThis.clearInterval,
    })
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          authorization_url:
            'https://identity.example/authorize?state=expected-state',
        }),
      }),
    )

    const controller = new AbortController()
    const login = startOidcLogin('corporate', controller.signal)
    const rejection = expect(login).rejects.toThrow(
      'El proveedor no pudo completar el acceso. Inicia sesión de nuevo.',
    )
    await vi.waitFor(() => expect(popupUrl).toContain('identity.example'))
    popupUrl =
      'https://nexora.example/api/v1/auth/oidc/callback?state=expected-state'

    await vi.advanceTimersByTimeAsync(300)

    await rejection
    expect(popup.close).toHaveBeenCalledOnce()
  })
})
