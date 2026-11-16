import { useApiInvalidation } from './useApiInvalidation'
import { useCallback, useEffect, useState } from 'react'
import { readApiJson } from '../services/readApiJson'
import type { WorkCatalogState } from '../types/WorkCatalogState'
export function useWorkCatalog<T>(
  path: string | null,
  parse: (value: unknown) => {
    items: T[]
    next_after: string | null
    total?: number
  },
): WorkCatalogState<T> {
  const [attempt, setAttempt] = useState(0)
  const [liveAttempt, setLiveAttempt] = useState(0),
    [state, setState] = useState<{
      key: string
      items: T[]
      total: number | null
      error: string | null
    }>({ key: '', items: [], total: null, error: null })
  useApiInvalidation(path, () => setLiveAttempt((value) => value + 1))
  const key = path ?? ''
  useEffect(() => {
    if (!path) return
    const controller = new AbortController()
    void (async () => {
      try {
        const items: T[] = []
        let after: string | null = null,
          total: number | null = null
        const seen = new Set<string>()
        do {
          const page = parse(
            await readApiJson(
              `${path}${path.includes('?') ? '&' : '?'}${new URLSearchParams({ limit: '100', ...(after ? { after } : {}) })}`,
              controller.signal,
            ),
          )
          items.push(...page.items)
          total = page.total ?? null
          after = page.next_after
          if (after) {
            if (seen.has(after))
              throw new Error('El catálogo devolvió una página repetida.')
            seen.add(after)
          }
        } while (after && !controller.signal.aborted)
        if (!controller.signal.aborted)
          setState({ key, items, total, error: null })
      } catch (error) {
        if (!controller.signal.aborted)
          setState({
            key,
            items: [],
            total: null,
            error:
              error instanceof Error
                ? error.message
                : 'No pudimos consultar el catálogo.',
          })
      }
    })()
    return () => controller.abort()
  }, [path, key, parse, liveAttempt, attempt])
  const reload = useCallback(() => setAttempt((value) => value + 1), [])
  return {
    items: state.key === key ? state.items : [],
    total: state.key === key ? state.total : null,
    error: state.key === key ? state.error : null,
    loading: path !== null && state.key !== key,
    reload,
  }
}
