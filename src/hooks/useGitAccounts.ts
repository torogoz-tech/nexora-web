import { useEffect, useState } from 'react'
import { getGitAccounts } from '../services/getGitAccounts'
import type { GitConnection } from '../types/GitConnection'
export function useGitAccounts() {
  const [attempt, setAttempt] = useState(0)
  const [result, setResult] = useState<{
    key: number
    accounts: GitConnection[]
    error: string | null
  }>({ key: -1, accounts: [], error: null })
  useEffect(() => {
    const controller = new AbortController()
    getGitAccounts(controller.signal)
      .then((accounts) => {
        if (!controller.signal.aborted)
          setResult({ key: attempt, accounts, error: null })
      })
      .catch((failure) => {
        if (!controller.signal.aborted)
          setResult({
            key: attempt,
            accounts: [],
            error:
              failure instanceof Error &&
              ![
                'TypeError',
                'TimeoutError',
                'AbortError',
                'SyntaxError',
              ].includes(failure.name)
                ? failure.message
                : 'No pudimos cargar las cuentas. Vuelve a intentarlo.',
          })
      })
    return () => controller.abort()
  }, [attempt])
  return {
    accounts: result.key === attempt ? result.accounts : [],
    error: result.key === attempt ? result.error : null,
    loading: result.key !== attempt,
    reload: () => setAttempt((v) => v + 1),
  }
}
