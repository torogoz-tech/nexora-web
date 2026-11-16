import { useEffect } from 'react'

const key = 'nexora.knowledge.project'

export function useKnowledgeProjectPreference(enabled: boolean, explicitProject: string | null) {
  let saved: string | null = null
  if (enabled) {
    try { saved = sessionStorage.getItem(key) } catch { /* Storage may be unavailable. */ }
  }
  useEffect(() => {
    if (!enabled || !explicitProject) return
    try { sessionStorage.setItem(key, explicitProject) } catch { /* URL selection still works. */ }
  }, [enabled, explicitProject])
  return saved
}
