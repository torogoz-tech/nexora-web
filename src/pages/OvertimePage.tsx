import { useState } from 'react'
import { Check, Clock3, Link2, Plus, RefreshCw, Search, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseOvertime } from '../utils/parseOvertime'
import { writeLaborCalendar } from '../services/writeLaborCalendar'
import type { OvertimeAction } from '../types/OvertimeAction'
import IconButton from '../components/IconButton'
import Dropdown from '../components/Dropdown'
import DataMessage from '../components/DataMessage'
import OvertimeEvidenceForm from '../components/OvertimeEvidenceForm'
import OvertimeForm from '../components/OvertimeForm'
export default function OvertimePage() {
  const { t, dateLocale } = useTranslation()
  const remote = useApiData('/api/v1/overtime', parseOvertime)
  const mutation = useIntegrationMutation()
  const [action, setAction] = useState<OvertimeAction | null>(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const statuses = { pending: t('Pendiente'), approved: t('Aprobado'), rejected: t('Rechazado') }
  const open = (next: OvertimeAction) => { mutation.clearError(); setAction(next) }
  const formatMinutes = (minutes: number) => t('{hours} h {minutes} min', { hours: Math.floor(minutes / 60), minutes: minutes % 60 })
  const date = (value: string) => new Intl.DateTimeFormat(dateLocale, { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${value.slice(0, 10)}T12:00:00Z`))
  const query = search.trim().toLocaleLowerCase()
  const items = remote.data?.items.filter(item => filter === 'all' || item.status === filter).filter(item => !query || `${item.actor_name} ${item.reason} ${item.date}`.toLocaleLowerCase().includes(query)) || []
  return <section className="flex min-w-0 flex-1 flex-col gap-6">
    <header className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="flex items-center gap-2 text-xl font-semibold"><Clock3 size={22} className="text-primary" />{t('Horas extras')}</h1><p className="mt-2 text-sm text-base-content/55">{t('Solicita y revisa el tiempo adicional con su historial de aprobación.')}</p></div><div className="flex gap-2"><IconButton label={t('Actualizar horas extras')} onClick={remote.reload} disabled={remote.loading || mutation.busy}><RefreshCw size={16} /></IconButton>{remote.data?.can_request && <IconButton label={t('Solicitar horas extras')} variant="primary" onClick={() => open({ path: '/api/v1/overtime' })}><Plus size={16} /></IconButton>}</div></header>
    {!remote.data ? <DataMessage loading={remote.loading} error={remote.error} onRetry={remote.reload} /> : <>
      <div className="grid gap-3 sm:grid-cols-3"><div className="rounded-2xl border border-base-300 bg-base-100 p-5"><p className="text-xs text-base-content/55">{t('Tiempo aprobado')}</p><p className="mt-2 text-xl font-semibold text-primary">{formatMinutes(remote.data.total_approved_minutes)}</p></div><div className="rounded-2xl border border-base-300 p-5"><p className="text-xs text-base-content/55">{t('Solicitudes pendientes')}</p><p className="mt-2 text-xl font-semibold">{remote.data.items.filter(item => item.status === 'pending').length}</p></div><div className="rounded-2xl border border-base-300 p-5"><p className="text-xs text-base-content/55">{t('Total de registros')}</p><p className="mt-2 text-xl font-semibold">{remote.data.items.length}</p></div></div>
      <section className="min-w-0"><div className="flex flex-wrap gap-3"><label className="input input-sm flex w-full items-center gap-2 sm:max-w-sm"><Search size={15} className="text-base-content/45" /><input type="search" aria-label={t('Buscar horas extras')} placeholder={t('Buscar por miembro, fecha o motivo')} value={search} onChange={event => setSearch(event.target.value)} /></label><Dropdown label={t('Estado')} className="w-44" value={filter} onChange={setFilter} options={[{ value: 'all', label: t('Todos los estados') }, ...Object.entries(statuses).map(([value, label]) => ({ value, label }))]} /></div>
        <ul className="mt-4 divide-y divide-base-300/60">{items.map(item => <li key={item.id} className="flex flex-wrap items-start justify-between gap-4 py-4"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-semibold">{item.actor_name}</h2><span className={`badge badge-sm ${item.status === 'pending' ? 'badge-warning' : item.status === 'approved' ? 'badge-success' : 'badge-ghost'}`}>{statuses[item.status]}</span></div><p className="mt-2 text-xs text-base-content/60">{date(item.date)} · {item.start_time} — {item.end_time}{item.next_day && ` (+1 ${t('día')})`} · {formatMinutes(item.minutes)}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm text-base-content/75">{item.reason}</p><p className="mt-2 text-xs text-base-content/45">{t('Solicitado')}: {date(item.created_at)}</p>{item.tasks.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{item.tasks.map(task => <span key={task.id} className="badge badge-soft badge-sm max-w-full whitespace-normal break-words">{task.title}</span>)}</div>}{item.commits.length > 0 && <div className="mt-2 flex flex-wrap gap-2 text-xs text-base-content/55">{item.commits.map(commit => <span key={commit.source_event_id} title={commit.sha}>{commit.repository_name} · <code>{commit.sha.slice(0, 8)}</code></span>)}</div>}{item.evidence_unavailable && <p className="mt-2 text-xs text-base-content/50">{t('Hay evidencias con acceso restringido.')}</p>}{item.decision_reason && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-base-content/60">{t('Decisión')}: {item.decision_reason}</p>}{item.decided_at && <p className="mt-1 text-xs text-base-content/45">{item.decided_by_name} · {date(item.decided_at)}</p>}</div>{item.can_attach_evidence && <IconButton label={t('Vincular evidencias')} disabled={mutation.busy} onClick={() => open({ path: `/api/v1/overtime/${encodeURIComponent(item.id)}/evidence`, evidenceId: item.id })}><Link2 size={16} /></IconButton>}{item.can_decide && <div className="flex gap-1"><IconButton label={t('Aprobar horas extras')} disabled={mutation.busy} onClick={() => open({ path: `/api/v1/overtime/${encodeURIComponent(item.id)}/decision`, approved: true })}><Check size={16} className="text-success" /></IconButton><IconButton label={t('Rechazar horas extras')} disabled={mutation.busy} onClick={() => open({ path: `/api/v1/overtime/${encodeURIComponent(item.id)}/decision`, approved: false })}><X size={16} className="text-error" /></IconButton></div>}</li>)}</ul>
        {!items.length && <p className="py-8 text-center text-sm text-base-content/50">{t('No hay registros que coincidan con los filtros.')}</p>}
      </section>
    </>}
    {action?.evidenceId && <OvertimeEvidenceForm id={action.evidenceId} busy={mutation.busy} error={mutation.error} onClose={() => setAction(null)} onSubmit={async input => { const ok = await mutation.run({ path: action.path, input }, async (signal, key) => { await writeLaborCalendar(action.path, 'POST', input, signal, key) }); if (ok) { setAction(null); remote.reload() } }} />}
    {action && !action.evidenceId && <OvertimeForm key={action.path} approved={action.approved} busy={mutation.busy} error={mutation.error} onClose={() => setAction(null)} onSubmit={async input => { const ok = await mutation.run({ path: action.path, input }, async (signal, key) => { await writeLaborCalendar(action.path, 'POST', input, signal, key) }); if (ok) { setAction(null); remote.reload() } }} />}
  </section>
}
