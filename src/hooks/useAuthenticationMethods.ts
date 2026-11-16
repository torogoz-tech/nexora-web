import { useEffect, useState } from 'react'
import { getAuthenticationMethods } from '../services/getAuthenticationMethods'
import type { AuthenticationMethods } from '../types/AuthenticationMethods'
export function useAuthenticationMethods() {
  const [methods, setMethods] = useState<AuthenticationMethods | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    const controller = new AbortController()
    getAuthenticationMethods(controller.signal)
      .then(setMethods)
      .catch(() => {
        if (!controller.signal.aborted)
          setError(
            'No pudimos consultar los métodos de acceso. Comprueba la conexión.',
          )
      })
    return () => controller.abort()
  }, [attempt])
  return {
    methods,
    error,
    retry: () => {
      setError(null)
      setMethods(null)
      setAttempt((value) => value + 1)
    },
  }
}
