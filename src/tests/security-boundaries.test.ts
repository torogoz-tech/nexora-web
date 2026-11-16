// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { apiFetch } from '../services/apiFetch'
import { sessionStore } from '../app/sessionStore'
import { canOpenWorkspacePath } from '../utils/canOpenWorkspacePath'
import { gitCallbackUrl } from '../utils/gitCallbackUrl'
import { parseEffectivePermissions } from '../utils/parseEffectivePermissions'

describe('browser security boundaries', () => {
  beforeEach(() => {
    sessionStore.current = undefined
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it.each([
    'https://attacker.example/api/v1/projects',
    '//attacker.example/api/v1/projects',
    '/api/v1/projects\\..\\admin',
    '/v1/projects',
  ])('rejects an API path outside the same-origin API namespace: %s', async path => {
    const fetcher = vi.fn()
    vi.stubGlobal('fetch', fetcher)

    await expect(apiFetch(path)).rejects.toThrow('invalid-api-path')
    expect(fetcher).not.toHaveBeenCalled()
  })

  it('forces same-origin credentials and browser metadata for API calls', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }))
    vi.stubGlobal('fetch', fetcher)

    await apiFetch('/api/v1/projects', { method: 'GET' })

    const [, init] = fetcher.mock.calls[0]
    expect(init.credentials).toBe('same-origin')
    expect(init.headers.get('Accept')).toBe('application/json')
    expect(init.headers.get('X-Nexora-Browser')).toBe(window.location.origin)
    expect(init.headers.has('Authorization')).toBe(false)
  })

  it('notifies the auth boundary on an expired authenticated session', async () => {
    sessionStore.current = { actorId: 'actor', sessionId: 'session', expiresAt: Date.now() + 60_000 }
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 401 }))
    const unauthorized = vi.fn()
    vi.stubGlobal('fetch', fetcher)
    window.addEventListener('nexora:unauthorized', unauthorized)

    await apiFetch('/api/v1/projects')

    expect(unauthorized).toHaveBeenCalledTimes(1)
    expect(unauthorized.mock.calls[0][0]).toMatchObject({ detail: 'session' })
    window.removeEventListener('nexora:unauthorized', unauthorized)
  })

  it('does not let a role name grant installation access without a server grant', () => {
    const permissions = parseEffectivePermissions({ actor_id: 'actor', role: 'super_admin', grants: [] })

    expect(canOpenWorkspacePath('/settings', permissions)).toBe(false)
    expect(canOpenWorkspacePath('/settings/members', permissions)).toBe(false)
    expect(canOpenWorkspacePath('/settings', { ...permissions, grants: [{ capability: 'installation:manage', project_id: null }] })).toBe(true)
  })

  it('rejects malformed or unknown effective permission payloads', () => {
    expect(() => parseEffectivePermissions(null)).toThrow()
    expect(() => parseEffectivePermissions({ actor_id: 'actor', role: 'root', grants: [] })).toThrow()
    expect(() => parseEffectivePermissions({ actor_id: 'actor', role: null, grants: [{ capability: 'projects:read', project_id: 42 }] })).toThrow()
  })

  it('accepts only same-origin callback URLs for provider flows', () => {
    expect(gitCallbackUrl('https://nexora.example/api/v1/git/github/callback', 'github', 'https://nexora.example').pathname)
      .toBe('/api/v1/git/github/callback')
    expect(() => gitCallbackUrl('https://attacker.example/api/v1/git/github/callback', 'github', 'https://nexora.example')).toThrow()
    expect(() => gitCallbackUrl('https://nexora.example/api/v1/git/github/callback?state=leak', 'github', 'https://nexora.example')).toThrow()
    expect(() => gitCallbackUrl('https://user:password@nexora.example/api/v1/git/github/callback', 'github', 'https://nexora.example')).toThrow()
  })
})
