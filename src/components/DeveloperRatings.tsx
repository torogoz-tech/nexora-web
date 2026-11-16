import Pagination from './Pagination'
import WikiMarkdown from './WikiMarkdown'
import RatingEvidenceAttachments from './RatingEvidenceAttachments'
import TaskCreatorIdentity from './TaskCreatorIdentity'
import { developerActivityReason } from '../utils/developerActivityReason'
import { useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { parseDeveloperRatings } from '../utils/parseDeveloperRatings'
import type { DeveloperRatingsProps } from '../types/DeveloperRatingsProps'
import DeveloperRatingModal from './DeveloperRatingModal'
import DataMessage from './DataMessage'
export default function DeveloperRatings({ actorId, year, projects }: DeveloperRatingsProps) {
  const { t, dateLocale } = useTranslation()
  const ratings = useApiData(`/api/v1/members/${encodeURIComponent(actorId)}/ratings?year=${year}`, parseDeveloperRatings)
  const [editing, setEditing] = useState(false), [period, setPeriod] = useState('daily'), [page,setPage]=useState(1)
  const data = ratings.data
  const daily=[...(data?.daily??[])].reverse(),periods=period==='weekly'?[...(data?.weekly??[])].reverse():[...(data?.monthly??[])].reverse(),total=period==='daily'?daily.length:periods.length,currentPage=Math.min(page,Math.max(1,Math.ceil(total/20))),offset=(currentPage-1)*20
  const format = (score: number | null) => score === null ? t('Sin calificación') : `${score.toLocaleString(dateLocale, { maximumFractionDigits: 2 })} / 5`
  const sources = { activity: 'Actividad diaria', peer: 'Compañero', manager: 'Responsable', ai: 'Calidad del código' }
  return <section aria-label={t('Calificación del desarrollador')}>
    {ratings.loading || ratings.error ? <DataMessage loading={ratings.loading} error={t(ratings.error)} onRetry={ratings.reload}/> : data && <>
      <div className="mb-4 flex items-center justify-between rounded-2xl bg-base-200/50 p-4"><div><p className="text-sm font-medium">{t('Promedio anual')} · {year}</p><p className="mt-1 text-xs text-base-content/50">{t('Cada día, semana y mes tiene el mismo peso dentro de su período.')}</p></div><strong className="shrink-0 text-lg text-primary">{format(data.annual)}</strong></div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div className="tabs tabs-box w-fit" role="tablist" aria-label={t('Período de calificación')}>{[['daily', 'Diario'], ['weekly', 'Semanal'], ['monthly', 'Mensual']].map(([id, label]) => <button type="button" key={id} role="tab" aria-selected={period === id} className={`tab ${period === id ? 'tab-active' : ''}`} onClick={() => {setPeriod(id!);setPage(1)}}>{t(label!)}</button>)}</div><Pagination compact page={currentPage} hasNext={offset+20<total} onPrevious={()=>setPage(currentPage-1)} onNext={()=>setPage(currentPage+1)}/></div>
      {period === 'daily' ? <div className="min-w-0">{data.daily.length ? daily.slice(offset,offset+20).map(day => <details key={day.date} className="py-4"><summary className="flex cursor-pointer list-none items-center gap-3 text-sm"><time dateTime={day.date}>{new Date(`${day.date}T12:00:00Z`).toLocaleDateString(dateLocale, { timeZone: 'UTC', month: 'short', day: 'numeric', weekday: 'short' })}</time><span className="ml-auto text-xs text-base-content/50">{day.excluded ? t('Excluido del promedio') : day.push ? t('Push registrado') : day.authored ? t('Commits atribuidos') : ''}</span><strong>{day.excluded ? '—' : format(day.score)}</strong></summary><ul className="mt-4 space-y-3">{day.entries.map(entry => <li key={entry.id} className="rounded-xl bg-base-200/40 p-3"><div className="flex items-center justify-between gap-2 text-xs"><span className="text-base-content/55">{t(sources[entry.source])}</span><strong>{format(entry.score)}</strong></div><div className="mt-2 text-sm">{entry.source==='activity'?t(developerActivityReason(entry.score,entry.reason)):<WikiMarkdown text={entry.reason} allowImages/>}</div><RatingEvidenceAttachments files={entry.attachments??[]}/><p className="mt-2 text-xs text-base-content/45">{entry.created_by&&<TaskCreatorIdentity actorId={entry.created_by} name={entry.created_by_name??undefined}/>}<time dateTime={entry.created_at}>{new Date(entry.created_at).toLocaleString(dateLocale)}</time></p>{entry.evidence_url && <a className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline" href={entry.evidence_url} target="_blank" rel="noopener noreferrer"><ExternalLink size={12}/>{t('Ver evidencia')}</a>}</li>)}</ul></details>) : <p className="p-5 text-sm text-base-content/50">{t('Todavía no hay valoraciones registradas.')}</p>}</div> : <ul className="grid gap-3 sm:grid-cols-2">{periods.slice(offset,offset+20).map(item => <li key={item.period} className="flex justify-between gap-2 rounded-xl border border-base-300 px-4 py-3 text-sm"><span>{item.period}</span><strong>{format(item.score)}</strong></li>)}</ul>}
    </>}
    {editing && <DeveloperRatingModal actorId={actorId} projects={projects} onClose={() => setEditing(false)} onCreated={() => { setEditing(false); ratings.reload() }}/>}
  </section>
}
