import { afterEach, expect, it, vi } from 'vitest'
import { gitCallbackUrl } from '../src/utils/gitCallbackUrl'
import { parseGitConfiguration } from '../src/utils/parseGitConfiguration'
import { parseGitConnectionPage } from '../src/utils/parseGitConnectionPage'
import { getGitConfiguration } from '../src/services/getGitConfiguration'
import { integrationRequest } from '../src/services/integrationRequest'
import { startGitConnection } from '../src/services/startGitConnection'
import { sessionStore } from '../src/app/sessionStore'
const signal = () => new AbortController().signal
afterEach(() => {
  sessionStore.current = null
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})
it('requires an exact same-origin callback without extra parameters or credentials', () => {
  expect(
    gitCallbackUrl(
      'https://web.test/api/v1/git/github/callback',
      'github',
      'https://web.test',
    ).pathname,
  ).toBe('/api/v1/git/github/callback')
  for (const uri of [
    'https://api.test/api/v1/git/github/callback',
    'https://web.test/api/v1/git/gitlab/callback',
    'https://web.test/api/v1/git/github/callback?redirect=evil',
    'https://token@web.test/api/v1/git/github/callback',
  ])
    expect(() => gitCallbackUrl(uri, 'github', 'https://web.test')).toThrow()
})
it('does not retain secrets returned by an unexpected provider response', () => {
  const config = parseGitConfiguration(
    {
      app_id: '12',
      slug: 'nexora',
      client_id: 'id',
      host: 'github.com',
      origin: 'https://github.com',
      redirect_uri: 'https://web.test/api/v1/git/github/callback',
      revision: 2,
      enabled: true,
      client_secret: 'DO NOT RETAIN',
      private_key_pem: 'PRIVATE',
    },
    'github',
  )
  expect(JSON.stringify(config)).not.toContain('DO NOT RETAIN')
  expect(config).not.toHaveProperty('private_key_pem')
  const page = parseGitConnectionPage({
    items: [
      {
        id: 'c',
        provider: 'gitlab',
        host: 'gitlab.com',
        owner_actor_id: 'actor',
        remote_login: 'dev',
        remote_account_id: '42',
        expires_at: '2026-11-05',
        status: 'active',
        revision: 1,
        tokens: { access_token: 'DO NOT RETAIN' },
      },
    ],
    next_cursor: null,
  })
  expect(JSON.stringify(page)).not.toContain('DO NOT RETAIN')
})
it('distinguishes missing provider configuration from restricted administration', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 403 })),
  )
  expect(await getGitConfiguration('github', signal())).toEqual({
    status: 'missing',
    configuration: null,
  })
  expect(await getGitConfiguration('gitlab', signal())).toEqual({
    status: 'restricted',
    configuration: null,
  })
})
it('supports revision changes and empty DELETE replies with a stable idempotency key', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response('{}'))
    .mockResolvedValueOnce(new Response(null, { status: 204 }))
  vi.stubGlobal('fetch', fetch)
  await integrationRequest(
    '/api/v1/git/github/configuration',
    'PATCH',
    { expected_revision: 3, enabled: false },
    'stable-state',
    signal(),
  )
  expect(
    await integrationRequest(
      '/api/v1/git/connections/c',
      'DELETE',
      undefined,
      'stable-revoke',
      signal(),
    ),
  ).toBeNull()
  const [, init] = fetch.mock.calls[0]!
  expect(JSON.parse(init.body)).toEqual({
    expected_revision: 3,
    enabled: false,
  })
  expect(new Headers(init.headers).get('Idempotency-Key')).toBe('stable-state')
  expect(fetch.mock.calls[1]![1].method).toBe('DELETE')
})
it('does not display secret provider error bodies', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(new Response('secret-access-token', { status: 422 })),
  )
  await expect(
    integrationRequest(
      '/api/v1/git/gitlab/configuration',
      'POST',
      {},
      'key',
      signal(),
    ),
  ).rejects.toThrow('Revisa los datos')
})
it('closes the popup before navigating when a provider returns a different callback origin', async () => {
  const popup = {
    opener: null,
    close: vi.fn(),
    location: { href: 'about:blank' },
  }
  vi.stubGlobal('window', {
    open: vi.fn(() => popup),
    location: { origin: 'https://web.test' },
  })
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockResolvedValue(
        new Response(
          JSON.stringify({
            state_id: 'gsa_qa',
            authorization_url:
              'https://github.com/login/oauth/authorize?state=gsa_qa.token&redirect_uri=https%3A%2F%2Fapi.test%2Fapi%2Fv1%2Fgit%2Fgithub%2Fcallback',
          }),
        ),
      ),
  )
  await expect(startGitConnection('github', signal())).rejects.toThrow(
    'mismo dominio',
  )
  expect(popup.close).toHaveBeenCalledOnce()
  expect(popup.location.href).toBe('about:blank')
})
