import { afterEach, expect, it, vi } from 'vitest'
import { parsePullRequest } from '../src/utils/parsePullRequest'
import { parseReferenceTargets } from '../src/utils/parseReferenceTargets'
import { safeExternalUrl } from '../src/utils/safeExternalUrl'
import { getReturnPath } from '../src/utils/getReturnPath'
import { createPullRequestLink } from '../src/services/createPullRequestLink'
import { removePullRequestLink } from '../src/services/removePullRequestLink'
import { sessionStore } from '../src/app/sessionStore'
afterEach(() => {
  sessionStore.current = null
  vi.unstubAllGlobals()
})
it('keeps a clean PR return URL but rejects external redirect targets', () => {
  expect(getReturnPath('/code/pull-requests/42?project=p&repository=r')).toBe(
    '/code/pull-requests/42?project=p&repository=r',
  )
  for (const path of [
    '//evil.test',
    '/\\evil.test',
    '/login',
    '/code/pull-requests/0',
  ])
    expect(getReturnPath(path)).toBe('/profile')
})
it('only opens credential-free HTTPS provider links', () => {
  expect(safeExternalUrl('https://github.com/org/repo/pull/42')).toBe(
    'https://github.com/org/repo/pull/42',
  )
  for (const path of [
    'javascript:alert(1)',
    'http://github.com',
    'https://token@github.com',
    '//github.com',
  ])
    expect(safeExternalUrl(path)).toBeNull()
})
it('rejects malformed provider data and pins the selected requirement version', () => {
  expect(() => parsePullRequest({ number: 1, title: 'Incomplete' })).toThrow()
  expect(
    parseReferenceTargets({
      items: [
        {
          id: 'doc',
          revision: 3,
          code: 'REQ-1',
          latest_title: 'Auth',
          latest_version_id: 'ver',
          latest_version_number: 2,
        },
      ],
      next_after: null,
    }).items[0],
  ).toEqual({
    id: 'doc',
    label: 'REQ-1 · Auth (v2)',
    revision: 3,
    versionId: 'ver',
  })
})
it('sends explicit version, revisions, reason and stable mutation keys', async () => {
  const base = '/api/v1/projects/p/repositories/r/pull-requests/42'
  const link = {
    id: 'link',
    kind: 'requirement',
    target_id: 'doc',
    version_id: 'ver',
    title: 'Auth',
    code: 'REQ-1',
    revision: 1,
    removed_at: null,
  }
  const fetch = vi
    .fn()
    .mockResolvedValueOnce(new Response(JSON.stringify(link), { status: 201 }))
    .mockResolvedValueOnce(
      new Response(
        JSON.stringify({ ...link, revision: 2, removed_at: '2026-11-05' }),
      ),
    )
  vi.stubGlobal('fetch', fetch)
  const input = {
    kind: 'requirement' as const,
    target_id: 'doc',
    target_revision: 3,
    version_id: 'ver',
    reason: 'Implements authentication',
  }
  await createPullRequestLink(
    base,
    input,
    'stable-create',
    new AbortController().signal,
  )
  await removePullRequestLink(
    base,
    'link',
    1,
    'Wrong relation',
    'stable-remove',
    new AbortController().signal,
  )
  expect(fetch.mock.calls[0]![0]).toBe(base + '/links')
  expect(JSON.parse(fetch.mock.calls[0]![1].body)).toEqual(input)
  expect(
    new Headers(fetch.mock.calls[0]![1].headers).get('Idempotency-Key'),
  ).toBe('stable-create')
  expect(fetch.mock.calls[1]![0]).toBe(base + '/links/link/remove')
  expect(JSON.parse(fetch.mock.calls[1]![1].body)).toEqual({
    expected_revision: 1,
    reason: 'Wrong relation',
  })
})
