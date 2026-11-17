import { UserRoundPlus, Mail, RefreshCw } from 'lucide-react'
import { Link } from 'react-router'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import DataMessage from '../components/DataMessage'
import IconButton from '../components/IconButton'
import { parseMemberRequests } from '../utils/parseMemberRequests'

export default function MemberRequestsPage() {
  const { t } = useTranslation()
  const data = useApiData('/api/v1/settings/member-requests', parseMemberRequests)
  return <section className="min-w-0 flex-1"><header className="mb-6 flex items-center justify-between gap-3"><div><h1 className="text-xl font-semibold">{t('Solicitudes de incorporación')}</h1><p className="mt-1 text-sm text-base-content/55">{t('Revisa identidades e invitaciones antes de asignarles un rol.')}</p></div><IconButton label={t('Actualizar solicitudes')} onClick={data.reload} disabled={data.loading}><RefreshCw size={16}/></IconButton></header>{data.loading||data.error?<DataMessage loading={data.loading} error={data.error} onRetry={data.reload}/>:<ul className="divide-y divide-base-300">{data.data?.map(request=><li key={`${request.kind}:${request.id}`} className="flex items-center gap-3 py-4"><span className="rounded-xl border border-base-300 p-2">{request.kind==='identity'?<UserRoundPlus size={17}/>:<Mail size={17}/>}</span><div className="min-w-0 flex-1"><p className="font-medium">{request.name}</p><p className="break-all text-sm text-base-content/55">{request.email}</p><p className="mt-1 text-xs text-base-content/45">{request.kind==='identity'?t('Identidad pendiente de rol'):t('Invitación pendiente de aceptación')}</p></div>{request.kind==='identity'&&<Link className="btn btn-sm btn-primary" to={`/settings/members/${encodeURIComponent(request.id)}`}>{t('Asignar rol')}</Link>}</li>)}{!data.data?.length&&<li className="py-8 text-sm text-base-content/55">{t('No hay solicitudes de incorporación pendientes.')}</li>}</ul>}</section>
}
