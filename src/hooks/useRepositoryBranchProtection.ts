import { useCallback, useEffect, useRef, useState } from 'react'
import { readApiJson } from '../services/readApiJson'
import { mutateRepositoryBranchProtection } from '../services/mutateRepositoryBranchProtection'
import { parseRepositoryBranchProtection } from '../utils/parseRepositoryBranchProtection'
import type { RepositoryBranchProtection } from '../types/RepositoryBranchProtection'
export function useRepositoryBranchProtection(path: string) {
 const [data, setData] = useState<RepositoryBranchProtection | null>(null)
 const [error, setError] = useState<string | null>(null)
 const [busy, setBusy] = useState(true)
 const [attempt, setAttempt] = useState(0)
 const [previewRevision, setPreviewRevision] = useState<number | null>(null)
 const active = useRef<AbortController | null>(null)
 useEffect(() => {
  const controller = new AbortController()
  active.current = controller
  readApiJson(path, controller.signal).then(value => {
   if (!controller.signal.aborted) { setData(parseRepositoryBranchProtection(value)); setError(null) }
  }).catch(() => {
   if (!controller.signal.aborted) setError('No pudimos consultar la protección de ramas. Vuelve a intentarlo.')
  }).finally(() => { if (!controller.signal.aborted) { setBusy(false); active.current = null } })
  return () => controller.abort()
 }, [path, attempt])
 useEffect(() => () => active.current?.abort(), [])
 const reload = useCallback(() => { if (!active.current) { setPreviewRevision(null); setBusy(true); setAttempt(value => value + 1) } }, [])
 const invalidatePreview = useCallback(() => setPreviewRevision(null), [])
 async function mutate(action: 'preview' | 'apply', checks: string[]) {
  if (active.current || action === 'apply' && previewRevision === null) return
  const controller = new AbortController()
  active.current = controller
  setBusy(true)
  setError(null)
  const expectedRevision = previewRevision
  setPreviewRevision(null)
  try {
   const result = await mutateRepositoryBranchProtection(path, action, action === 'preview' ? { required_checks: checks } : { expected_revision: expectedRevision! }, controller.signal)
   if (!controller.signal.aborted) {
    setData(result)
    if (action === 'preview' && result.status === 'prepared') setPreviewRevision(result.revision)
   }
  } catch (failure) {
   if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'No pudimos confirmar la protección de ramas. Consulta el estado antes de volver a intentarlo.')
  } finally { if (!controller.signal.aborted) { active.current = null; setBusy(false) } }
 }
 return { data, error, busy, previewRevision, reload, invalidatePreview, mutate }
}
