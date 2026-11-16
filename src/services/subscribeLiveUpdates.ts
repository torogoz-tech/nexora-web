import { getSession } from './getSession'
import { browserHeaders } from './browserHeaders'
import { SseDecoder } from '../utils/SseDecoder'
import type { LiveConnectionState } from '../types/LiveConnectionState'
export async function subscribeLiveUpdates(
  projectId: string | null,
  signal: AbortSignal,
  onState: (state: LiveConnectionState) => void,
) {
  let delay = 1000
  while (!signal.aborted) {
    const session = getSession()
    if (!session) {
      onState('unavailable')
      return
    }
    const local = new AbortController()
    let timer: ReturnType<typeof setTimeout> | undefined
    const arm = (ms: number) => {
      clearTimeout(timer)
      timer = setTimeout(() => local.abort(), ms)
    }
    const controllerSignal = AbortSignal.any([signal, local.signal])
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
    try {
      arm(15000)
      const response = await fetch(
        `/api/v1/events${projectId ? `?${new URLSearchParams({ project_id: projectId })}` : ''}`,
        {
          headers: browserHeaders({ Accept: 'text/event-stream' }),
          credentials: 'same-origin',
          signal: controllerSignal,
          cache: 'no-store',
        },
      )
      if (response.status === 401) {
        window.dispatchEvent(
          new CustomEvent('nexora:unauthorized', {
            detail: session.sessionId,
          }),
        )
        onState('unavailable')
        return
      }
      if (response.status === 403 || response.status === 404) {
        onState('unavailable')
        return
      }
      if (
        !response.ok ||
        !response.headers.get('content-type')?.includes('text/event-stream') ||
        !response.body
      )
        throw Error('SSE unavailable')
      reader = response.body.getReader()
      const decoder = new SseDecoder()
      arm(45000)
      let reconnect = false
      while (!signal.aborted && !reconnect) {
        const chunk = await reader.read()
        if (chunk.done) break
        arm(45000)
        for (const event of decoder.feed(chunk.value)) {
          if (event.event === 'access-lost') {
            window.dispatchEvent(
              new CustomEvent('nexora:invalidate', {
                detail: { projectId, topics: ['access'] },
              }),
            )
            onState('unavailable')
            return
          }
          if (event.event === 'reconnect') {
            reconnect = true
            break
          }
          if (event.event !== 'invalidate') continue
          const data: unknown = JSON.parse(event.data)
          if (
            typeof data !== 'object' ||
            data === null ||
            !('topics' in data) ||
            !Array.isArray(data.topics) ||
            !data.topics.every((t) => typeof t === 'string')
          )
            throw Error('Invalid SSE update')
          delay = 1000
          onState('connected')
          window.dispatchEvent(
            new CustomEvent('nexora:invalidate', {
              detail: { projectId, topics: data.topics },
            }),
          )
        }
      }
    } catch {
      if (signal.aborted) return
    } finally {
      clearTimeout(timer)
      local.abort()
      await reader?.cancel().catch(() => {})
      reader?.releaseLock()
    }
    if (signal.aborted) return
    onState('unavailable')
    await new Promise<void>((resolve) => {
      const done = () => {
        clearTimeout(timeout)
        signal.removeEventListener('abort', done)
        resolve()
      }
      const timeout = setTimeout(done, delay)
      signal.addEventListener('abort', done, { once: true })
    })
    delay = Math.min(delay * 2, 30000)
  }
}
