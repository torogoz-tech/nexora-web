import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../src/services/apiFetch'
import { sessionStore } from '../src/app/sessionStore'

describe('authenticated API access', () => {
  afterEach(() => {
    sessionStore.current = null
    vi.unstubAllGlobals()
  })

  it('uses same-origin cookies only for internal API calls', async () => {
    sessionStore.current = {
      sessionId: 'test-session',
      actorId: 'actor',
      expiresAt: Date.now() + 60000,
    }
    const request = vi.fn().mockResolvedValue(new Response('{}'))
    vi.stubGlobal('fetch', request)
    await apiFetch('/api/v1/projects')
    expect(
      new Headers(request.mock.calls[0]![1].headers).get('Authorization'),
    ).toBeNull()
    expect(request.mock.calls[0]![1].credentials).toBe('same-origin')
    await expect(apiFetch('https://outside.example/api')).rejects.toThrow(
      'invalid-api-path',
    )
    expect(request).toHaveBeenCalledTimes(1)
  })

  it('signals session invalidation on 401 but keeps permission failures separate', async () => {
    sessionStore.current = {
      sessionId: 'test-session',
      actorId: 'actor',
      expiresAt: Date.now() + 60000,
    }
    const dispatchEvent = vi.fn()
    vi.stubGlobal('window', { dispatchEvent })
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(new Response('{}', { status: 403 }))
        .mockResolvedValueOnce(new Response('{}', { status: 401 })),
    )
    await apiFetch('/api/v1/projects')
    expect(dispatchEvent).not.toHaveBeenCalled()
    await apiFetch('/api/v1/projects')
    expect(dispatchEvent).toHaveBeenCalledOnce()
    const event = dispatchEvent.mock.calls[0]![0] as CustomEvent<string>
    expect(event.type).toBe('nexora:unauthorized')
    expect(event.detail).toBe('test-session')
  })
})
