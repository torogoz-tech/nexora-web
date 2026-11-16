import { useEffect, useState } from 'react'
import { subscribeLiveUpdates } from '../services/subscribeLiveUpdates'
import type { LiveConnectionState } from '../types/LiveConnectionState'
export function useLiveUpdates(projectId: string | null | undefined) {
  const [state, setState] = useState<{
    key: string | null | undefined
    status: LiveConnectionState
  }>({ key: undefined, status: 'connecting' })
  useEffect(() => {
    if (projectId === undefined) return
    const controller = new AbortController()
    void subscribeLiveUpdates(projectId, controller.signal, (status) => {
      if (!controller.signal.aborted) setState({ key: projectId, status })
    })
    return () => controller.abort()
  }, [projectId])
  return state.key === projectId ? state.status : 'connecting'
}
