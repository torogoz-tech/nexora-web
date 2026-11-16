import KnowledgeApprovals from '../components/KnowledgeApprovals'
import { useState } from 'react'
import { Link } from 'react-router'
import { Check, ClipboardCheck, Eye, RefreshCw, Search, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { useProjectApprovals } from '../hooks/useProjectApprovals'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseLaborCalendar } from '../utils/parseLaborCalendar'
import { parseOvertime } from '../utils/parseOvertime'
import { pendingLaborApprovals } from '../utils/pendingLaborApprovals'
import { decideProjectApproval } from '../services/decideProjectApproval'
import { writeLaborCalendar } from '../services/writeLaborCalendar'
import type { PendingApproval } from '../types/PendingApproval'
import IconButton from '../components/IconButton'
import Dropdown from '../components/Dropdown'
import Tooltip from '../components/Tooltip'
import Pagination from '../components/Pagination'
import DataMessage from '../components/DataMessage'
import LaborCalendarForm from '../components/LaborCalendarForm'
import ProjectApprovalDecisionForm from '../components/ProjectApprovalDecisionForm'
export default function ApprovalsPage() {
  const { t, dateLocale } = useTranslation()
  const calendar = useApiData('/api/v1/labor-calendar', parseLaborCalendar)
  const overtime = useApiData('/api/v1/overtime', parseOvertime)
  const projects = useProjectApprovals()
  const mutation = useIntegrationMutation()
  const [action, setAction] = useState<{ item: PendingApproval; approved: boolean } | null>(null)
  const [kind, setKind] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const labels = { vacation: t('Vacaciones'), leave: t('Permiso'), holiday: t('Feriados y asuetos'), overtime: t('Horas extras'), task: t('Tarea'), document_version: t('Documento') }
  const query = search.trim().toLocaleLowerCase()
  const items = [...pendingLaborApprovals(calendar.data, overtime.data), ...projects.data].filter(item => (kind === 'all' || item.kind === kind) && (!query || `${item.title} ${item.member} ${item.reason}`.toLocaleLowerCase().includes(query))).sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
  const pages = Math.max(1, Math.ceil(items.length / 20)), current = Math.min(page, pages)
  const visible = items.slice((current - 1) * 20, current * 20)
  const reload = () => { calendar.reload(); overtime.reload(); projects.reload() }
  const submit = async (input: unknown) => {
    if (!action || !action.item.canDecide) return
    const path = action.item.revision !== undefined ? `${action.item.path}/decisions` : action.item.path
    const ok = await mutation.run({ path, input }, async (signal, key) => { if (action.item.revision !== undefined) await decideProjectApproval(path, input, signal, key); else await writeLaborCalendar(path, 'POST', input, signal, key) })
    if (ok) { setAction(null); reload() }
  }
  const open = (item: PendingApproval, approved: boolean) => { mutation.clearError(); setAction({ item, approved }) }
  const formatDate = (value: string) => new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`))
  return <section className="min-w-0 flex-1">
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><h1 className="flex items-center gap-2 text-xl font-semibold"><ClipboardCheck size={22} />{t('Aprobaciones')}</h1><p className="mt-2 text-sm text-base-content/55">{t('Revisa las solicitudes pendientes y registra tu decisión.')}</p></div><IconButton label={t('Actualizar aprobaciones')} onClick={reload} disabled={mutation.busy}><RefreshCw size={16} /></IconButton></header>
    <div className="flex flex-wrap items-center gap-3"><label className="input input-sm flex flex-1 items-center gap-2"><Search size={16} /><input type="search" aria-label={t('Buscar solicitudes')} placeholder={t('Buscar solicitudes')} value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} /></label><Dropdown label={t('Tipo de solicitud')} className="w-52" value={kind} onChange={value => { setKind(value); setPage(1) }} options={[{ value: 'all', label: t('Todas las solicitudes') }, ...Object.entries(labels).map(([value, label]) => ({ value, label }))]} /></div>
    <Pagination page={current} totalPages={pages} hasNext={current < pages} onPage={setPage} onPrevious={() => setPage(current - 1)} onNext={() => setPage(current + 1)} count={visible.length} total={items.length} />
    {(calendar.error || overtime.error || projects.error) && <p role="alert" className="my-4 text-sm text-error">{t(calendar.error || overtime.error || projects.error)}</p>}
    {(calendar.loading || overtime.loading || projects.loading) && <DataMessage loading error={null} />}
    <ul className="mt-3 divide-y divide-base-300">{visible.map(item => <li key={`${item.kind}:${item.id}`} className="flex flex-wrap items-center justify-between gap-4 py-4"><div className="min-w-0 flex-1"><p className="text-xs text-base-content/55">{labels[item.kind]}</p><h2 className="mt-1 font-medium">{item.title}</h2><p className="mt-1 text-xs text-base-content/55">{formatDate(item.date)}{item.endDate && item.endDate !== item.date && ` — ${formatDate(item.endDate)}`}</p>{item.reason && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-base-content/70">{item.reason}</p>}</div><div className="flex items-center gap-1">{item.kind === 'task' && <Tooltip label={t('Ver tarea')}><Link to={`/tasks/${encodeURIComponent(item.resourceId!)}`} aria-label={t('Ver tarea')} className="btn btn-sm btn-square btn-ghost"><Eye size={16} /></Link></Tooltip>}{item.canDecide ? <><IconButton label={t('Aprobar solicitud')} onClick={() => open(item, true)} disabled={mutation.busy}><Check size={16} className="text-success" /></IconButton><IconButton label={t('Rechazar solicitud')} onClick={() => open(item, false)} disabled={mutation.busy}><X size={16} className="text-error" /></IconButton></> : <span className="text-xs text-base-content/50">{t('Pendiente de aprobación')}</span>}</div></li>)}</ul>
    {!items.length && !calendar.loading && !overtime.loading && !projects.loading && <p className="py-8 text-sm text-base-content/55">{t('No hay solicitudes pendientes.')}</p>}
    <KnowledgeApprovals/>
    {action && (action.item.revision !== undefined ? <ProjectApprovalDecisionForm item={action.item} approved={action.approved} busy={mutation.busy} error={mutation.error} onClose={() => setAction(null)} onSubmit={submit} /> : <LaborCalendarForm country={calendar.data?.settings.country ?? ''} mode="decision" approved={action.approved} busy={mutation.busy} error={mutation.error} onClose={() => setAction(null)} onSubmit={submit} />)}
  </section>
}
