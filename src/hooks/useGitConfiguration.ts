import { useEffect, useState } from 'react'
import { getGitConfiguration } from '../services/getGitConfiguration'
import type { GitProvider } from '../types/GitProvider'
import type { GitConfigurationState } from '../types/GitConfigurationState'
export function useGitConfiguration(provider: GitProvider) {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{
    key: string
    data: GitConfigurationState | null
    error: string | null
  }>({ key: '', data: null, error: null })
  const key = `${provider}:${attempt}`
  useEffect(() => {
    const controller = new AbortController()
    getGitConfiguration(provider, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setResult({ key, data, error: null })
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({
            key,
            data: null,
            error:
              'No pudimos consultar la configuración. Vuelve a intentarlo.',
          })
      })
    return () => controller.abort()
  }, [provider, key])
  return {
    data: result.key === key ? result.data : null,
    error: result.key === key ? result.error : null,
    loading: result.key !== key,
    reload: () => setAttempt((x) => x + 1),
  }
}
