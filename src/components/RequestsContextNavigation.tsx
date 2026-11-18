import RequestTypeGlyph from './RequestTypeGlyph'
import { Link, useLocation, useSearchParams } from 'react-router'
import { Mail, ChartNoAxesCombined, UsersRound } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useWorkspaceNavigation } from '../hooks/useWorkspaceNavigation'
import { useTranslation } from '../hooks/useTranslation'
import { parseServiceRequestTypes } from '../utils/parseServiceRequestTypes'
import type { WorkContextNavigationProps } from '../types/WorkContextNavigationProps'
import DataMessage from './DataMessage'

export default function RequestsContextNavigation({ onClose }: WorkContextNavigationProps) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [params] = useSearchParams()
  const members = useWorkspaceNavigation()
    .find(area => area.id === 'requests')
    ?.items.find(item => item.path === '/settings/members')
  const types = useApiData('/api/v1/requests/types', parseServiceRequestTypes)
  const selected = params.get('type')
  const total = types.data?.items.reduce((sum, type) => sum + (type.total ?? 0), 0)
  function target(type: string) {
    const next = new URLSearchParams(params)
    next.delete('page')
    if (type) next.set('type', type)
    else next.delete('type')
    return `/requests${next.size ? `?${next}` : ''}`
  }
  return <nav aria-label={t('Solicitudes')} className="flex flex-col gap-1">
    <Link to={target('')} onClick={onClose} className="context-nav-item" aria-current={pathname === '/requests' && !selected ? 'page' : undefined}>
      <Mail size={16} className="shrink-0" aria-hidden="true"/>
      <span className="min-w-0 flex-1 truncate">{t('Solicitudes')}</span>
      {total !== undefined && <span className="rounded-md bg-base-100/60 px-2 py-0.5 text-xs tabular-nums text-base-content/60">{total}</span>}
    </Link>
    <div className="ml-4 mt-1 flex flex-col gap-1">
      <DataMessage loading={types.loading} error={types.error} onRetry={types.reload}/>
      {types.data?.items.filter(type => !type.archived || type.total).map(type => <Link key={type.id} to={target(type.id)} onClick={onClose} className="context-nav-item" aria-current={pathname === '/requests' && selected === type.id ? 'page' : undefined}>
        <RequestTypeGlyph icon={type.icon} color={type.color} size={16}/>
        <span className="min-w-0 flex-1 truncate">{t(type.name)}</span>
        {type.total !== null && <span className="rounded-md bg-base-100/60 px-2 py-0.5 text-xs tabular-nums text-base-content/60">{type.total}</span>}
      </Link>)}
    </div>
    {[{path:'/requests/reports',label:'Reportes',icon:ChartNoAxesCombined}].map(({path,label,icon:Icon})=><Link key={path} to={path} onClick={onClose} className="context-nav-item" aria-current={pathname===path?'page':undefined}><Icon size={16} aria-hidden="true"/><span>{t(label)}</span></Link>)}
    {members && <Link to={members.path} onClick={onClose} className="context-nav-item" aria-current={pathname===members.path || pathname.startsWith(`${members.path}/`) ? 'page' : undefined}><UsersRound size={16} aria-hidden="true"/><span>{t(members.label)}</span></Link>}
  </nav>
}
