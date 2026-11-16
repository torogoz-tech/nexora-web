import { afterEach, expect, it, vi } from 'vitest'
import { getGitAccounts } from '../src/services/getGitAccounts'
import { filterGitAccounts } from '../src/utils/filterGitAccounts'
import { getReturnPath } from '../src/utils/getReturnPath'
import { sessionStore } from '../src/app/sessionStore'
import type { GitConnection } from '../src/types/GitConnection'
const github: GitConnection = {
  id: 'account-github',
  provider: 'github',
  host: 'github.com',
  owner_actor_id: 'qa',
  remote_login: 'Infinitech',
  remote_account_id: '42',
  installation_id: '123',
  status: 'active',
  revision: 1,
  expires_at: '2026-12-01',
}
const gitlab: GitConnection = {
  ...github,
  id: 'account-gitlab',
  provider: 'gitlab',
  host: 'gitlab.company.test',
  remote_login: 'Operations',
  installation_id: null,
  status: 'revoked',
}
afterEach(() => {
  sessionStore.current = null
  vi.unstubAllGlobals()
})
it('searches accounts, hosts and installations and combines the provider filter', () => {
  const accounts = [github, gitlab]
  expect(filterGitAccounts(accounts, ' INFINITECH ', 'all')).toEqual([github])
  expect(filterGitAccounts(accounts, 'company.test', 'all')).toEqual([gitlab])
  expect(filterGitAccounts(accounts, '123', 'github')).toEqual([github])
  expect(filterGitAccounts(accounts, 'Infinitech', 'gitlab')).toEqual([])
  expect(filterGitAccounts(accounts, '', 'all')).toEqual(accounts)
})
it('fetches every page so search includes accounts beyond the first page', async () => {
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({ items: [github], next_cursor: 'cursor-next' }),
      ),
    )
    .mockResolvedValueOnce(
      new Response(JSON.stringify({ items: [gitlab], next_cursor: null })),
    )
  vi.stubGlobal('fetch', fetch)
  const accounts = await getGitAccounts(new AbortController().signal)
  expect(fetch.mock.calls[1]![0]).toBe(
    '/api/v1/git/connections?limit=100&after=cursor-next',
  )
  expect(filterGitAccounts(accounts, 'Operations', 'all')).toEqual([gitlab])
})
it('rejects a looping API cursor instead of requesting pages forever', async () => {
  vi.stubGlobal(
    'fetch',
    vi
      .fn()
      .mockImplementation(() =>
        Promise.resolve(
          new Response(
            JSON.stringify({ items: [github], next_cursor: 'repeated' }),
          ),
        ),
      ),
  )
  await expect(getGitAccounts(new AbortController().signal)).rejects.toThrow(
    'página repetida',
  )
})
it('allows a protected return to the new accounts submenu', () => {
  expect(getReturnPath('/settings/accounts')).toBe('/settings/accounts')
})
