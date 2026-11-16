import RequestWorkspace from './RequestWorkspace'
import { NavigationOrderContext } from './NavigationOrderContext'
import { parseNavigationOrder } from '../utils/parseNavigationOrder'
import { orderSettingsNavigation } from '../utils/orderSettingsNavigation'
import type { NavigationOrder } from '../types/NavigationOrder'
import { useEffect, useEffectEvent, useState } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router'
import { useAuth } from '../hooks/useAuth'
import { useApiData } from '../hooks/useApiData'
import { parseEffectivePermissions } from '../utils/parseEffectivePermissions'
import { canOpenWorkspacePath } from '../utils/canOpenWorkspacePath'
import { workspaceNavigationForRole } from '../utils/workspaceNavigationForRole'
import { WorkspacePermissionsContext } from './WorkspacePermissionsContext'
import { WorkspaceNavigationContext } from './WorkspaceNavigationContext'
import DataMessage from '../components/DataMessage'
import { useTranslation } from '../hooks/useTranslation'
export default function WorkspaceNavigationProvider({ children }: { children: ReactNode }) {
  const { session } = useAuth()
  const { pathname } = useLocation()
  const { t } = useTranslation()
  const permissions = useApiData(session ? '/api/v1/me/permissions' : null, parseEffectivePermissions)
  useEffect(() => {
    if (!session) return
    const refresh = () => window.dispatchEvent(new CustomEvent('nexora:invalidate', { detail: { projectId: null, topics: ['permissions'] } }))
    refresh()
    const timer = window.setInterval(refresh, 15000)
    window.addEventListener('focus', refresh)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh) }
  }, [session])
  const order=useApiData(session&&permissions.data&&permissions.data.role!=='user'&&permissions.data.role!=='supervisor'?'/api/v1/settings/navigation':null,parseNavigationOrder)
  const [confirmedOrder,setConfirmedOrder]=useState<{actorId:string,order:NavigationOrder}|null>(null)
  const refreshOrder=useEffectEvent(()=>window.dispatchEvent(new CustomEvent('nexora:invalidate',{detail:{projectId:null,topics:['navigation']}})))
  useEffect(()=>{if(!session)return;const refresh=()=>refreshOrder();const timer=window.setInterval(refresh,30000);window.addEventListener('focus',refresh);return()=>{window.clearInterval(timer);window.removeEventListener('focus',refresh)}},[session])
  const confirmed=confirmedOrder?.actorId===session?.actorId?confirmedOrder?.order:null
  const preferred=confirmed&&(!order.data||confirmed.revision>=order.data.revision)?confirmed:order.data
  const data = permissions.data
  if (!data || data.actor_id !== session?.actorId) return <div className="p-6"><DataMessage loading={permissions.loading || !!data && data.actor_id !== session?.actorId} error={permissions.error} onRetry={permissions.reload}/></div>
  if(data.role==='user'||data.role==='supervisor')return <WorkspacePermissionsContext value={data}><RequestWorkspace/></WorkspacePermissionsContext>
  if (!canOpenWorkspacePath(pathname, data)) return <main className="p-6"><p role="alert">{t('No tienes permiso para realizar esta acción.')}</p><Link className="link mt-4 inline-block" to="/profile">{t('Mi perfil')}</Link></main>
  const navigation = orderSettingsNavigation(workspaceNavigationForRole(data.role),preferred?.paths??[]).map(item => ({ ...item, items: item.items.filter(page => canOpenWorkspacePath(page.path, data)) })).filter(item => item.items.length > 0)
  return <WorkspacePermissionsContext value={data}><NavigationOrderContext value={{data:preferred,error:order.error,loading:order.loading,onSaved:value=>{if(session)setConfirmedOrder({actorId:session.actorId,order:value})}}}><WorkspaceNavigationContext value={navigation}>{children}</WorkspaceNavigationContext></NavigationOrderContext></WorkspacePermissionsContext>
}
