import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { parseDailyDeveloperAnalysis } from '../utils/parseDailyDeveloperAnalysis'
import { parseDailyAnalysisDirectory } from '../utils/parseDailyAnalysisDirectory'
import Dropdown from '../components/Dropdown'
import IconButton from '../components/IconButton'
import DataMessage from '../components/DataMessage'
export default function DailyDeveloperAnalysisPage() {
 const { t } = useTranslation()
 const directory = useApiData('/api/v1/developer-analyses/members', parseDailyAnalysisDirectory)
 const [selected, setSelected] = useState(''), [selectedDate, setDate] = useState('')
 const member = directory.data?.items.find(item => item.id === selected) ?? directory.data?.items[0]
 const date = selectedDate || directory.data?.latest_date || ''
 const report = useApiData(member && date ? `/api/v1/developer-analyses?member_id=${encodeURIComponent(member.id)}&date=${encodeURIComponent(date)}` : null, parseDailyDeveloperAnalysis)
 const messages = { pending: 'El análisis está pendiente de procesamiento.', running: 'El análisis se está preparando.', no_evidence: 'No hay actividad registrada para analizar en esta fecha.', failed: 'No se pudo completar el análisis. No se reintentará automáticamente.', not_available: 'No hay un análisis guardado para esta fecha.', complete: '' }
 return <section className="min-w-0 flex-1"><h1 className="text-xl font-semibold">{t('Análisis diario del equipo')}</h1><p className="mb-6 mt-2 text-sm text-base-content/60">{t('Resumen de tareas, commits y conocimiento registrado por día. Se prepara automáticamente al cerrar la jornada.')}</p>
  {directory.loading || directory.error ? <DataMessage loading={directory.loading} error={directory.error} onRetry={directory.reload}/> : !member ? <p>{t('No hay desarrolladores autorizados para mostrar.')}</p> : <>
   <div className="mb-6 flex flex-wrap items-end gap-3"><div className="flex min-w-56 flex-1 flex-col gap-2 text-sm"><span>{t('Desarrollador')}</span><Dropdown label={t('Desarrollador')} className="w-full" value={member.id} options={directory.data!.items.map(item => ({ value: item.id, label: item.name }))} onChange={setSelected}/></div><label className="flex flex-col gap-2 text-sm">{t('Fecha')}<input aria-label={t('Fecha')} type="date" className="input input-sm input-bordered" max={directory.data!.latest_date} value={date} onChange={event => setDate(event.target.value)}/></label><IconButton label={t('Actualizar')} onClick={report.reload}><RefreshCw size={18}/></IconButton></div>
   <p className="mb-4 text-xs text-base-content/55">{directory.data!.timezone}</p>
   {report.loading || report.error ? <DataMessage loading={report.loading} error={report.error} onRetry={report.reload}/> : report.data && <article className="border-t border-base-300 py-5">{report.data.report ? <p className="whitespace-pre-wrap text-sm leading-relaxed">{report.data.report.summary}</p> : <p role="status" className="text-sm text-base-content/65">{t(messages[report.data.status])}</p>}
    {!!report.data.evidence?.items.length && <details className="mt-5"><summary className="cursor-pointer text-sm font-medium">{t('Actividad registrada')}</summary><p className="mt-3 text-xs text-base-content/50">{t('Se muestran hasta ocho registros por tipo de actividad.')}</p><ul className="mt-3 space-y-3">{report.data.evidence.items.map((item, index) => <li key={`${item.kind}:${item.id}:${index}`} className="border-t border-base-300 pt-3 text-sm"><span className="text-xs text-base-content/50">{t(item.kind === 'commit' ? 'Commits' : item.kind === 'task' ? 'Tareas' : 'Conocimiento')} · {new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short', timeZone: directory.data!.timezone }).format(new Date(item.occurred_at))}</span><p className="mt-1 font-medium">{item.title.startsWith('knowledge.') ? t('Aportes técnicos') : item.title}</p>{item.kind !== 'task' && !item.title.startsWith('knowledge.') && item.detail !== item.title && <p className="mt-1 whitespace-pre-wrap text-base-content/60">{item.detail}</p>}</li>)}</ul></details>}
   </article>}
  </>}
 </section>
}
