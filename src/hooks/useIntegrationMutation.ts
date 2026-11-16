import { useEffect, useRef, useState } from 'react'
export function useIntegrationMutation() {
  const active = useRef<AbortController | null>(null)
  const receipt = useRef<{ signature: string; key: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => () => active.current?.abort(), [])
  async function run(
    signature: unknown,
    action: (signal: AbortSignal, key: string) => Promise<void>,
  ) {
    if (active.current) return false
    const controller = new AbortController()
    active.current = controller
    setBusy(true)
    setError(null)
    const serialized = JSON.stringify(signature)
    if (receipt.current?.signature !== serialized)
      receipt.current = { signature: serialized, key: crypto.randomUUID() }
    try {
      await action(controller.signal, receipt.current.key)
      if (!controller.signal.aborted) receipt.current = null
      return !controller.signal.aborted
    } catch (failure) {
      if (!controller.signal.aborted)
        setError(
          failure instanceof Error &&
            ![
              'TypeError',
              'SyntaxError',
              'TimeoutError',
              'AbortError',
            ].includes(failure.name)
            ? failure.message
            : 'No pudimos confirmar el cambio. Vuelve a intentarlo.',
        )
      return false
    } finally {
      active.current = null
      if (!controller.signal.aborted) setBusy(false)
    }
  }
  return {
    busy,
    error,
    clearError: () => setError(null),
    run,
    cancel: () => {
      active.current?.abort()
      setBusy(false)
    },
  }
}
