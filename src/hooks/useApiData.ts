import { ApiReadError } from '../types/ApiReadError'
import { useApiInvalidation } from './useApiInvalidation'
import { useCallback, useEffect, useState } from 'react'
import { readApiJson } from '../services/readApiJson'
import type { ApiDataState } from '../types/ApiDataState'
export function useApiData<T>(
  path: string | null,
  parse: (value: unknown) => T,
) {
  const [attempt, setAttempt] = useState(0)
  const [liveAttempt, setLiveAttempt] = useState(0)
  const [state, setState] = useState<ApiDataState<T>>({
    key: '',
    data: null,
    error: null,
  })
  useApiInvalidation(path, () => setLiveAttempt((value) => value + 1))
  const key = path ?? ''
  useEffect(() => {
    if (!path) return
    const controller = new AbortController()
    readApiJson(path, controller.signal)
      .then((value) => {
        if (!controller.signal.aborted)
          setState({ key, data: parse(value), error: null })
      })
      .catch((error) => {
        if (!controller.signal.aborted)
          setState((previous) => ({
            key,
            data: previous.key === key && (error instanceof TypeError || error instanceof Error && error.name === 'TimeoutError' || error instanceof ApiReadError && error.status >= 500) ? previous.data : null,
            error:
              error instanceof Error &&
              error.name !== 'TypeError' &&
              error.name !== 'TimeoutError'
                ? error.message
                : 'No pudimos conectar con Nexora. Vuelve a intentarlo.',
          }))
      })
    return () => controller.abort()
  }, [path, key, parse, attempt, liveAttempt])
  const reload = useCallback(() => setAttempt((value) => value + 1), [])
  return {
    data: state.key === key ? state.data : null,
    error: state.key === key ? state.error : null,
    loading: path !== null && state.key !== key,
    reload,
  }
}
