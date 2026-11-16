import { afterEach, describe, expect, it, vi } from 'vitest'
import { updateProject } from '../src/services/updateProject'
import { getProjects } from '../src/services/getProjects'
import { sessionStore } from '../src/app/sessionStore'

describe('project editing and archiving', () => {
  afterEach(() => {
    sessionStore.current = null
    vi.unstubAllGlobals()
  })
  it('guards edits and archival with the observed revision', async () => {
    sessionStore.current = null
    const updated = {
      id: 'prj-test',
      name: 'Smart Ticket',
      description: null,
      archived: true,
      revision: 3,
    }
    const request = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify(updated)))
    vi.stubGlobal('fetch', request)
    const change = {
      name: 'Smart Ticket',
      description: null,
      archived: true,
      expected_revision: 2,
    }
    expect(
      await updateProject(
        'prj-test',
        change,
        'stable-update',
        new AbortController().signal,
      ),
    ).toEqual(updated)
    const [path, options] = request.mock.calls[0]!
    expect(path).toBe('/api/v1/projects/prj-test')
    expect(options.method).toBe('PUT')
    expect(JSON.parse(options.body)).toEqual(change)
    expect(new Headers(options.headers).get('Idempotency-Key')).toBe(
      'stable-update',
    )
  })
  it('reports conflicts instead of overwriting changes', async () => {
    sessionStore.current = null
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('{}', { status: 409 })),
    )
    await expect(
      updateProject(
        'prj-test',
        {
          name: 'Smart Ticket',
          description: null,
          archived: false,
          expected_revision: 2,
        },
        'stable-update',
        new AbortController().signal,
      ),
    ).rejects.toThrow('actualiza')
  })
  it('can traverse all pages when looking for archived projects', async () => {
    sessionStore.current = null
    const request = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ items: [], next_cursor: null })),
      )
    vi.stubGlobal('fetch', request)
    await getProjects(new AbortController().signal, true, 'cursor-next')
    const url = new URL(request.mock.calls[0]![0], 'https://nexora.local')
    expect(url.searchParams.get('include_archived')).toBe('true')
    expect(url.searchParams.get('after')).toBe('cursor-next')
  })
})
