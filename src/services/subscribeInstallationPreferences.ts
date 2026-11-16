import { SseDecoder } from '../utils/SseDecoder'
import { parseInstallationPreferences } from '../utils/parseInstallationPreferences'
import type { InstallationPreferences } from '../types/InstallationPreferences'
export async function subscribeInstallationPreferences(
  signal: AbortSignal,
  onValue: (value: InstallationPreferences) => void,
) {
  let delay = 1000
  while (!signal.aborted) {
    const attempt = new AbortController()
    let idle: ReturnType<typeof setTimeout> | undefined
    const resetIdle = () => {
      clearTimeout(idle)
      idle = setTimeout(() => attempt.abort(), 45000)
    }
    try {
      resetIdle()
      const response = await fetch('/api/v1/public/preferences/events', {
        headers: { Accept: 'text/event-stream' },
        signal: AbortSignal.any([signal, attempt.signal]),
      })
      if (
        !response.ok ||
        !response.headers.get('content-type')?.includes('text/event-stream') ||
        !response.body
      )
        throw Error('stream-unavailable')
      const reader = response.body.getReader()
      const decoder = new SseDecoder()
      try {
        while (!signal.aborted) {
          const chunk = await reader.read()
          if (chunk.done) break
          resetIdle()
          for (const frame of decoder.feed(chunk.value)) {
            if (frame.event === 'preferences') {
              onValue(parseInstallationPreferences(JSON.parse(frame.data)))
              delay = 1000
            }
          }
        }
      } finally {
        await reader.cancel().catch(() => {})
        reader.releaseLock()
      }
    } catch {
      /* Older deployments remain usable with the cached default. */
    } finally {
      clearTimeout(idle)
      attempt.abort()
    }
    if (signal.aborted) return
    await new Promise<void>((resolve) => {
      const stop = () => {
        clearTimeout(timer)
        signal.removeEventListener('abort', stop)
        resolve()
      }
      const timer = setTimeout(stop, delay)
      signal.addEventListener('abort', stop, { once: true })
    })
    delay = Math.min(delay * 2, 30000)
  }
}
