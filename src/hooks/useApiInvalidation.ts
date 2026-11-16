import { useEffect, useEffectEvent } from 'react'
import { matchesLiveUpdate } from '../utils/matchesLiveUpdate'
import type { LiveUpdate } from '../types/LiveUpdate'
export function useApiInvalidation(path: string | null, onUpdate: () => void) {
  const refresh = useEffectEvent(onUpdate)
  useEffect(() => {
    const listener = (event: Event) => {
      if (
        event instanceof CustomEvent &&
        matchesLiveUpdate(path, event.detail as LiveUpdate)
      )
        refresh()
    }
    window.addEventListener('nexora:invalidate', listener)
    return () => window.removeEventListener('nexora:invalidate', listener)
  }, [path])
}
