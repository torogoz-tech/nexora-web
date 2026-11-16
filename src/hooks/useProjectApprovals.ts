import { useContext, useEffect, useState } from 'react'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { getProjectApprovals } from '../services/getProjectApprovals'
import { useApiInvalidation } from './useApiInvalidation'
import type { PendingApproval } from '../types/PendingApproval'
export function useProjectApprovals() {
  const permissions = useContext(WorkspacePermissionsContext)
  const key = JSON.stringify(permissions)
  const [attempt, setAttempt] = useState(0)
  const [state, setState] = useState<{ key: string; data: PendingApproval[]; error: string | null }>({ key: '', data: [], error: null })
  useApiInvalidation('/api/v1/approval-inbox', () => setAttempt(value => value + 1))
  useEffect(() => {
    const controller = new AbortController()
    const access = JSON.parse(key) as typeof permissions
    if (!access) return
    getProjectApprovals(controller.signal, access).then(data => {
      if (!controller.signal.aborted) setState({ key, data, error: null })
    }).catch(error => {
      if (!controller.signal.aborted) setState({ key, data: [], error: error instanceof Error ? error.message : 'No pudimos consultar los datos. Vuelve a intentarlo.' })
    })
    return () => controller.abort()
  }, [key, attempt])
  return { loading: permissions !== null && state.key !== key, data: state.key === key ? state.data : [], error: state.key === key ? state.error : null, reload: () => setAttempt(value => value + 1) }
}
