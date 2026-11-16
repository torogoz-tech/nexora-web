import { useContext, useEffect, useSyncExternalStore } from 'react'
import { authContext } from '../app/authContext'

// Scope the preference to the signed-in member. URLs always override it.
export function useProjectPreference(explicitProject: string | null) {
  const auth = useContext(authContext)
  const key = `nexora.project.${auth?.session?.actorId ?? 'anonymous'}`
  const saved = useSyncExternalStore(
    listener => {
      window.addEventListener('storage', listener)
      window.addEventListener('nexora:project-selection', listener)
      return () => {
        window.removeEventListener('storage', listener)
        window.removeEventListener('nexora:project-selection', listener)
      }
    },
    () => { try { return localStorage.getItem(key) } catch { return null } },
    () => null,
  )
  useEffect(() => {
    if (explicitProject === null) return
    try {
      if (localStorage.getItem(key) === explicitProject) return
      localStorage.setItem(key, explicitProject)
      window.dispatchEvent(new Event('nexora:project-selection'))
    } catch { /* URL filters remain usable when storage is disabled. */ }
  }, [key, explicitProject])
  return explicitProject ?? saved
}
