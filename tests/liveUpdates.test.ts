import { describe, it, expect, vi, afterEach } from 'vitest'
import { SseDecoder } from '../src/utils/SseDecoder'
import { matchesLiveUpdate } from '../src/utils/matchesLiveUpdate'
import { parseCatalogTaskTypePage } from '../src/utils/parseCatalogTaskTypePage'
import { parseProjectTaskTypeSelection } from '../src/utils/parseProjectTaskTypeSelection'
import { subscribeLiveUpdates } from '../src/services/subscribeLiveUpdates'
import { sessionStore } from '../src/app/sessionStore'
describe('live project updates', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    sessionStore.current = null
  })
  it('decodes chunked UTF8, CRLF, comments and multiline frames', () => {
    const d = new SseDecoder(),
      bytes = new TextEncoder().encode(
        ': pulse\r\n\r\nevent: invalidate\r\ndata: {"topics":\r\ndata: ["decisión"]}\r\n\r\n',
      )
    const events = []
    for (const byte of bytes) events.push(...d.feed(new Uint8Array([byte])))
    expect(events).toEqual([
      { event: 'invalidate', data: '{"topics":\n["decisión"]}' },
    ])
  })
  it('limits partial frames', () =>
    expect(() =>
      new SseDecoder().feed(new TextEncoder().encode('x'.repeat(65537))),
    ).toThrow())
  it('never invalidates a different project or global endpoint', () => {
    expect(
      matchesLiveUpdate('/api/v1/projects/p1/documents', {
        projectId: 'p1',
        topics: ['documents'],
      }),
    ).toBe(true)
    expect(
      matchesLiveUpdate('/api/v1/projects/p12/documents', {
        projectId: 'p1',
        topics: ['documents'],
      }),
    ).toBe(false)
    expect(
      matchesLiveUpdate('/api/v1/task-types', {
        projectId: 'p1',
        topics: ['documents'],
      }),
    ).toBe(false)
  })
  it('authenticates the stream without a query token and closes on access loss', async () => {
    sessionStore.current = {
      sessionId: 'test-session',
      actorId: 'a',
      expiresAt: Date.now() + 600000,
    }
    const dispatched: CustomEvent[] = []
    vi.stubGlobal(
      'CustomEvent',
      class {
        constructor(
          public type: string,
          public options: { detail: unknown },
        ) {}
        get detail() {
          return this.options.detail
        }
      },
    )
    vi.stubGlobal('window', {
      dispatchEvent: (e: CustomEvent) => dispatched.push(e),
    })
    const fetch = vi.fn().mockResolvedValue(
      new Response(
        new ReadableStream({
          start(c) {
            c.enqueue(
              new TextEncoder().encode(
                'event: invalidate\ndata: {"topics":["documents"]}\n\nevent: access-lost\ndata: {}\n\n',
              ),
            )
            c.close()
          },
        }),
        { headers: { 'content-type': 'text/event-stream' } },
      ),
    )
    vi.stubGlobal('fetch', fetch)
    const statuses: string[] = []
    await subscribeLiveUpdates('p1', new AbortController().signal, (s) =>
      statuses.push(s),
    )
    expect(fetch.mock.calls[0][0]).toBe('/api/v1/events?project_id=p1')
    expect(fetch.mock.calls[0][1].headers.has('Authorization')).toBe(false)
    expect(fetch.mock.calls[0][1].credentials).toBe('same-origin')
    expect(statuses).toEqual(['connected', 'unavailable'])
    expect(dispatched).toHaveLength(2)
  })
  it('validates catalog pages and optimistic project selections', () => {
    expect(parseCatalogTaskTypePage({ items: [] }).next_after).toBeNull()
    expect(
      parseProjectTaskTypeSelection({ codes: ['task'], revision: 0 }).codes,
    ).toEqual(['task'])
    expect(() =>
      parseProjectTaskTypeSelection({ codes: ['task', 'task'], revision: 1 }),
    ).toThrow()
  })
})
