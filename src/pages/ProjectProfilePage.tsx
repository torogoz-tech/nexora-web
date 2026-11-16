import ProfileActivityFeed from '../components/ProfileActivityFeed'
import UserAvatar from '../components/UserAvatar'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft, Archive, CalendarDays, FolderGit2, FolderKanban, ListTodo, RefreshCw, Users } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { parseProjectProfile } from '../utils/parseProjectProfile'
import ProfileContributions from '../components/ProfileContributions'
import DataMessage from '../components/DataMessage'
import IconButton from '../components/IconButton'
import RowAction from '../components/RowAction'
import Dropdown from '../components/Dropdown'

export default function ProjectProfilePage({ projectId }: { projectId: string }) {
  const { t, dateLocale } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [currentYear] = useState(() => new Date().getUTCFullYear())
  const requestedYear = Number(params.get('year'))
  const year = Number.isInteger(requestedYear) && requestedYear >= 2000 && requestedYear <= currentYear ? requestedYear : currentYear
  const profile = useApiData(`/api/v1/projects/${encodeURIComponent(projectId)}/profile?year=${year}`, parseProjectProfile)
  const data = profile.data
  const years = Array.from({ length: Math.min(5, currentYear - 1999) }, (_, index) => currentYear - index)
  if (!years.includes(year)) years.push(year)
  return <section className="flex min-w-0 flex-1 flex-col" aria-label={t('Perfil del proyecto')}>
    <header className="mb-7 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2"><RowAction label={t('Volver a proyectos')} to="/settings/projects"><ArrowLeft size={16} /></RowAction><span className="text-xs font-medium text-base-content/45">{t('Perfil del proyecto')}</span></div>
      <IconButton label={t('Actualizar perfil')} disabled={profile.loading} onClick={profile.reload}><RefreshCw size={16} /></IconButton>
    </header>
    {data && profile.error && <p role="alert" className="mb-4 text-sm text-error">{t(profile.error)}</p>}
    {!data ? <DataMessage loading={profile.loading} error={t(profile.error)} onRetry={profile.reload} /> : data ? <div className="grid min-w-0 gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
      <aside className="min-w-0">
        <div className="mb-5 flex size-32 items-center justify-center rounded-3xl border border-primary/15 bg-primary/10 text-primary"><FolderKanban size={56} strokeWidth={1.4} aria-hidden="true" /></div>
        <h1 className="break-words text-2xl font-semibold tracking-tight">{data.project.name}</h1>
        {data.project.description&&<p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-base-content/60">{data.project.description}</p>}
        <div className="mt-5 space-y-3 text-xs text-base-content/55">
          <p className="flex items-center gap-2"><Archive size={14} aria-hidden="true" /><span className="rounded-lg bg-base-200 px-2 py-1">{t(data.project.archived ? 'Archivado' : 'Activo')}</span></p>
          <p className="flex items-start gap-2"><CalendarDays size={14} className="mt-0.5 shrink-0" aria-hidden="true" /><span>{t('Creado el {0}', { '0': new Date(data.project.created_at).toLocaleDateString(dateLocale) })}</span></p>
        </div>
        <section className="mt-6 border-t border-base-300 pt-5" aria-labelledby="project-profile-members-title">
          <h2 id="project-profile-members-title" className="mb-4 flex items-center gap-2 text-sm font-semibold"><Users size={15} aria-hidden="true" />{t('Miembros')}<span className="ml-auto text-xs text-base-content/40">{data.members.length}</span></h2>
          {data.members.length ? <ul className="space-y-3">{data.members.slice(0, 24).map(member => <li key={member.id} className="flex min-w-0 items-center gap-3"><Link to={`/settings/members/${encodeURIComponent(member.id)}`} aria-label={t('Ver perfil de {0}',{'0':member.name})}><UserAvatar actorId={member.id} revision={member.avatar_revision} name={member.name}/></Link><div className="min-w-0"><Link className="break-words text-sm font-medium hover:underline" to={`/settings/members/${encodeURIComponent(member.id)}`}>{member.name}</Link><p className="break-words text-xs text-base-content/45">{member.position || t('Sin posición laboral')}</p></div></li>)}</ul> : <p className="text-xs text-base-content/45">{t('No hay miembros para mostrar.')}</p>}
          {data.members.length > 24 && <p className="mt-3 text-xs text-base-content/45">{t('Y {0} miembros más', { '0': String(data.members.length - 24) })}</p>}
        </section>
      </aside>
      <div className="min-w-0 space-y-9">
        <section aria-label={t('Resumen del proyecto')}><dl className="grid grid-cols-2 gap-3 xl:grid-cols-4">{[{ key: 'tasks', label: 'Tareas' }, { key: 'documents', label: 'Documentos' }, { key: 'requirements', label: 'Requerimientos' }, { key: 'features', label: 'Funcionalidades' }].map(metric => <div key={metric.key} className="rounded-2xl border border-base-300 p-4"><dt className="text-xs text-base-content/50">{t(metric.label)}</dt><dd className="mt-2 text-2xl font-semibold tabular-nums">{data.counts[metric.key as keyof typeof data.counts].toLocaleString(dateLocale)}</dd></div>)}</dl></section>
        <section aria-labelledby="project-profile-repositories-title">
          <header className="mb-4 flex justify-between gap-3"><h2 id="project-profile-repositories-title" className="font-semibold">{t('Repositorios')}</h2><span className="text-xs text-base-content/45">{data.repositories.length}</span></header>
          {data.repositories.length ? <div className="grid gap-3 sm:grid-cols-2">{data.repositories.map(repository => <article key={repository.id} className="flex min-w-0 flex-col rounded-2xl border border-base-300 bg-base-200/25 p-4"><div className="flex items-start gap-2"><FolderGit2 size={17} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" /><h3 className="break-words text-sm font-semibold"><Link className="rounded-sm hover:text-primary hover:underline focus-visible:outline-primary" to={`/code/repositories/${encodeURIComponent(data.project.id)}/${encodeURIComponent(repository.id)}`}>{repository.name}</Link></h3></div><footer className="mt-auto flex flex-wrap gap-2 pt-4 text-xs text-base-content/55"><span>{repository.provider ?? t('Código registrado')}</span><span className="ml-auto rounded-lg bg-base-200 px-2 py-0.5">{t(['active', 'authorized'].includes(repository.status) ? 'Autorizado' : repository.status === 'awaiting_authorization' ? 'Pendiente de autorización' : repository.status === 'revoked' ? 'Revocado' : repository.status === 'disconnected' ? 'Desconectado' : 'Código registrado')}</span></footer></article>)}</div> : <p className="rounded-2xl border border-dashed border-base-300 px-5 py-8 text-center text-sm text-base-content/45">{t('No hay repositorios autorizados para mostrar todavía.')}</p>}
        </section>
        <section aria-labelledby="project-profile-priority-title">
          <header className="mb-3 flex justify-between gap-3"><h2 id="project-profile-priority-title" className="font-semibold">{t('Prioridad alta')}</h2><span className="text-xs text-base-content/45">{data.priority_tasks.length}</span></header>
          {data.priority_tasks.length ? <ul className="divide-y divide-base-300">{data.priority_tasks.map(task => <li key={task.id} className="flex items-start gap-3 py-4"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning"><ListTodo size={16} aria-hidden="true" /></span><h3 className="min-w-0 flex-1 break-words text-sm font-medium">{task.title}</h3><span className="text-xs text-warning">{t(task.priority === 'critical' ? 'Crítica' : 'Alta')}</span></li>)}</ul> : <p className="rounded-2xl border border-dashed border-base-300 px-5 py-6 text-sm text-base-content/45">{t('No hay tareas de prioridad alta pendientes.')}</p>}
        </section>
        <div><div className="mb-4 ml-auto w-28"><Dropdown label={t('Año de actividad')} value={String(year)} options={years.map(value => ({ value: String(value), label: String(value) }))} onChange={value => setParams(previous => { const next = new URLSearchParams(previous); next.set('year', value); return next })} /></div><ProfileContributions year={data.year} contributions={data.contributions} /></div>
        <ProfileActivityFeed emptyMessage="Todavía no hay actividad registrada en este proyecto." key={`${projectId}:${year}`} events={data.activity} projectName={() => data.project.name} commitPath={event => event.kind === 'commit' && event.commit_sha && event.repository_id ? `/code/repositories/${event.project_id}/${event.repository_id}/commits/${event.commit_sha}` : undefined} />
      </div>
    </div> : null}
  </section>
}
