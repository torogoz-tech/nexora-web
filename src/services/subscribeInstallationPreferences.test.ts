import { afterEach, expect, it, vi } from 'vitest'
import { subscribeInstallationPreferences } from './subscribeInstallationPreferences'
afterEach(() => vi.unstubAllGlobals())
it('reads anonymous preference snapshots and changes without exposing a credential', async () => {
  const controller = new AbortController()
  const values: unknown[] = []
  const request = vi.fn(
    async () =>
      new Response(
        new ReadableStream({
          start(stream) {
            stream.enqueue(
              new TextEncoder().encode(
                'event: preferences\ndata: {"language":"es","revision":1}\n\nevent: preferences\ndata: {"language":"en","revision":2}\n\n',
              ),
            )
          },
        }),
        { headers: { 'Content-Type': 'text/event-stream' } },
      ),
  )
  vi.stubGlobal('fetch', request)
  await subscribeInstallationPreferences(controller.signal, (value) => {
    values.push(value)
    if (value.revision === 2) controller.abort()
  })
  expect(values).toEqual([
    { language: 'es', revision: 1 },
    { language: 'en', revision: 2 },
  ])
  expect(request).toHaveBeenCalledOnce()
  const [url, options] = request.mock.calls[0] as unknown as [
    string,
    RequestInit,
  ]
  expect(url).toBe('/api/v1/public/preferences/events')
  expect(new Headers(options.headers).has('Authorization')).toBe(false)
  expect(options.signal?.aborted).toBe(true)
})
