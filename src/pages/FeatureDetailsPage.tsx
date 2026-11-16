import KnowledgeReviewControls from '../components/KnowledgeReviewControls'
import LinkedServiceRequests from '../components/LinkedServiceRequests'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft, CheckCheck, ClipboardList, Layers3, RefreshCw } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { useLiveUpdates } from '../hooks/useLiveUpdates'
import { parseFeatureCatalog } from '../utils/parseFeatureCatalog'
import { completeFeature } from '../services/completeFeature'
import DataMessage from '../components/DataMessage'
import IconButton from '../components/IconButton'
import RowAction from '../components/RowAction'
import WikiMarkdown from '../components/WikiMarkdown'

export default function FeatureDetailsPage({ id }: { id: string }) {
 const { t } = useTranslation()
 const [params] = useSearchParams()
 const project = params.get('project') ?? ''
 useLiveUpdates(project || undefined)
 const remote = useApiData(project ? `/api/v1/projects/${encodeURIComponent(project)}/features` : null, parseFeatureCatalog)
 const mutation = useIntegrationMutation()
 const catalog = remote.data
 const feature = catalog?.items.find(item => item.id === id)
 const back = `/knowledge/features?${new URLSearchParams({ project })}`
 const links = catalog?.links.filter(link => link.feature_id === id) ?? []
 return <section className="min-w-0 flex-1" aria-label={t('Detalle de funcionalidad')}>
  <header className="mb-7 flex items-center justify-between gap-3"><RowAction to={back} label={t('Volver al catálogo')}><ArrowLeft size={16}/></RowAction><div className="flex gap-2">{catalog?.can_complete && feature && !feature.archived && feature.status !== 'completed' && <IconButton label={t('Completar funcionalidad')} disabled={mutation.busy} onClick={() => void mutation.run({ feature: id, revision: feature.revision }, async (signal, key) => { await completeFeature(project, id, feature.revision, key, signal); remote.reload(); window.dispatchEvent(new CustomEvent('nexora:invalidate', { detail: { projectId: project, topics: ['features', 'knowledge'] } })) })}><CheckCheck size={16}/></IconButton>}<IconButton label={t('Actualizar funcionalidades')} disabled={remote.loading} onClick={remote.reload}><RefreshCw size={16}/></IconButton></div></header>
  {!project ? <DataMessage message={t('Selecciona un proyecto para consultar sus funcionalidades.')}/> : remote.loading || remote.error ? <DataMessage loading={remote.loading} error={t(remote.error)} onRetry={remote.reload}/> : !feature ? <DataMessage message={t('La funcionalidad no está disponible.')}/> : <>
   <div className="mb-6 flex flex-wrap items-center gap-3"><Layers3 size={22} aria-hidden="true"/><h1 className="min-w-0 break-words font-serif text-3xl">{feature.name}</h1><span className="badge badge-sm badge-ghost">{t(feature.archived ? 'Archivada' : feature.status === 'completed' ? 'Completada' : 'Activa')}</span></div>
   <WikiMarkdown text={feature.description} allowImages/>
   <section className="mt-8 border-t border-base-300 pt-6" aria-label={t('Requerimientos vinculados')}><h2 className="mb-4 font-semibold">{t('Requerimientos vinculados')}</h2><ul className="space-y-4">{links.map(link => <li key={`${link.requirement_id}:${link.proposal_id}`} className="rounded-xl border border-base-300 p-4"><p className="mb-2 flex items-center gap-2 text-xs text-base-content/55"><ClipboardList size={14} aria-hidden="true"/>{t('Requerimiento')}</p><Link className="font-medium hover:underline" to={`/knowledge/requirements?${new URLSearchParams({ project, article: link.requirement_id })}`}>{catalog?.proposals.find(proposal => proposal.requirement_id === link.requirement_id)?.requirement_title ?? t('Ver requerimiento')}</Link><div className="mt-2"><WikiMarkdown text={link.impact} allowImages/></div></li>)}</ul>{links.length === 0 && <p className="text-sm text-base-content/50">{t('Sin requerimientos vinculados.')}</p>}</section>
   <section className="mt-8 border-t border-base-300 pt-6"><h2 className="mb-4 font-semibold">{t('Tareas vinculadas')}</h2><ul className="space-y-2">{feature.task_ids.map(task => <li key={task}><Link className="text-sm hover:underline" to={`/tasks/${encodeURIComponent(task)}?${new URLSearchParams({ returnTo: `/knowledge/features/${encodeURIComponent(id)}?${new URLSearchParams({ project })}` })}`}>{t('Ver tarea')} · {task}</Link></li>)}</ul>{feature.task_ids.length === 0 && <p className="text-sm text-base-content/50">{t('{0} tareas vinculadas', { '0': '0' })}</p>}</section>
  <KnowledgeReviewControls kind="feature" id={id} revision={feature.revision} project={project} onChanged={remote.reload}/><LinkedServiceRequests kind="feature" target={id}/></>}
  {mutation.error && <p role="alert" className="mt-4 text-sm text-error">{t(mutation.error)}</p>}
 </section>
}
