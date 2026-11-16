import { useEffect } from 'react'
import { Sparkles, RefreshCw } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { useWorkspacePermission } from '../hooks/useWorkspacePermission'
import { useTranslation } from '../hooks/useTranslation'
import { apiFetch } from '../services/apiFetch'
import { parsePullRequestReviews } from '../utils/parsePullRequestReviews'
import type { PullRequestReviewsProps } from '../types/PullRequestReviewsProps'
import IconButton from './IconButton'
import DataMessage from './DataMessage'
import CodeViewer from './CodeViewer'
export default function PullRequestReviews({ basePath, headSha, baseSha, projectId }: PullRequestReviewsProps) {
 const { t, dateLocale } = useTranslation()
 const data = useApiData(`${basePath}/reviews`, parsePullRequestReviews)
 const mutation = useIntegrationMutation()
 const canRequest = useWorkspacePermission('knowledge:write', projectId)
 const running = data.data?.some(v => v.status === 'running') ?? false
 useEffect(() => {
  if (!running) return
  const timer = window.setInterval(data.reload, 5000)
  return () => window.clearInterval(timer)
 }, [running, data.reload])
 async function request() {
  await mutation.run([basePath, headSha], async (signal, key) => {
   const response = await apiFetch(`${basePath}/reviews`, { method: 'POST', signal, headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key }, body: JSON.stringify({ expected_head_sha: headSha }) }, 90000)
   if (response.status === 403) throw new Error('No tienes permiso para solicitar esta revisión.')
   if (response.status === 409) throw new Error('La PR cambió. Actualiza sus datos antes de solicitar la revisión.')
   if (!response.ok) throw new Error('No se pudo completar la revisión. Comprueba la configuración de OpenAI y los límites del cambio.')
   data.reload()
  })
 }
 const labels = { running: 'En análisis', completed: 'Completada', failed: 'No completada', stale: 'La PR cambió', interrupted: 'Interrumpida; resultado desconocido' }
 return <section className="py-6" aria-label="Code Reviews">
  <header className="mb-5 flex items-start justify-between gap-4">
   <div><h2 className="font-semibold">Code Reviews</h2><p className="mt-2 text-sm text-base-content/60">{t('Solicita a la IA de Nexora una revisión de esta PR. No publica comentarios ni aprueba cambios en Git.')}</p></div>
   <div className="flex gap-2"><IconButton label={t('Actualizar revisiones')} onClick={data.reload} disabled={data.loading}><RefreshCw size={16}/></IconButton>{canRequest && <IconButton label={t('Solicitar Code Review')} onClick={request} disabled={mutation.busy || running || !headSha || !baseSha} aria-busy={mutation.busy}><Sparkles size={16}/></IconButton>}</div>
  </header>
  {mutation.error && <p role="alert" className="mb-4 text-sm text-error">{t(mutation.error)}</p>}
  {data.loading || data.error ? <DataMessage loading={data.loading} error={data.error} onRetry={data.reload}/> : !data.data?.length ? <DataMessage message={t('Todavía no hay revisiones para esta PR.')}/> : <div className="space-y-6">{data.data.map(review => <article key={review.id} className="border-t border-base-300 pt-5">
   <header className="mb-4 flex flex-wrap justify-between gap-2 text-sm"><strong>{t(labels[review.status === 'completed' && (review.head_sha !== headSha || review.base_sha !== baseSha) ? 'stale' : review.status])}</strong><span className="text-base-content/50">{new Date(review.created_at).toLocaleString(dateLocale)} · {review.model ?? '—'}</span></header>
   {review.status === 'interrupted' && <p className="mb-4 text-sm text-base-content/60">{t('La solicitud pudo haber llegado al proveedor. No se vuelve a ejecutar automáticamente.')}</p>}
   {review.report && <><p className="whitespace-pre-wrap text-sm leading-relaxed">{review.report.summary}</p>{review.report.findings.map((f, index) => <section key={index} className="mt-5"><h3 className="text-sm font-semibold">{f.severity} · {f.title}</h3><p className="mt-2 whitespace-pre-wrap text-sm text-base-content/70">{f.body}</p><p className="my-2 break-all font-mono text-xs text-base-content/50">{f.path}:{f.line}</p><CodeViewer code={f.evidence} language="plaintext"/></section>)}{review.report.limitations.length > 0 && <ul className="mt-4 list-inside list-disc text-sm text-base-content/60">{review.report.limitations.map((s,i)=><li key={i}>{s}</li>)}</ul>}</>}
  </article>)}</div>}
 </section>
}
