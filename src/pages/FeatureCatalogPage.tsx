import AlphabeticSortButton from '../components/AlphabeticSortButton'
import {useAlphabeticOrder} from '../hooks/useAlphabeticOrder'
import { useState } from 'react'
import { useSearchParams, Link } from 'react-router'
import { Layers3, RefreshCw, Search } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useLiveUpdates } from '../hooks/useLiveUpdates'
import { useProjectScope } from '../hooks/useProjectScope'
import { useApiData } from '../hooks/useApiData'
import { parseFeatureCatalog } from '../utils/parseFeatureCatalog'
import ProjectPicker from '../components/ProjectPicker'
import DataMessage from '../components/DataMessage'
import IconButton from '../components/IconButton'
import Dropdown from '../components/Dropdown'
export default function FeatureCatalogPage() {
 const order=useAlphabeticOrder()
  const { t } = useTranslation()
  const scope = useProjectScope()
  const live = useLiveUpdates(scope.projectId || undefined)
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('q') ?? '')
  const [status, setStatus] = useState('pending')
  const data = useApiData(scope.projectId ? `/api/v1/projects/${encodeURIComponent(scope.projectId)}/features` : null, parseFeatureCatalog)
  const catalog = data.data
  const statuses: Record<string, string> = { pending: t('Pendiente'), approved: t('Aprobada'), rejected: t('Rechazada') }
  const normalized = search.toLocaleLowerCase().trim()
  const features = (catalog?.items ?? []).filter(item => `${item.name} ${item.description}`.toLocaleLowerCase().includes(normalized)).sort((a, b) => order.compare(a.name,b.name))
  const proposals = (catalog?.proposals ?? []).filter(item => item.status === status).filter(item => `${item.requirement_title} ${item.reason} ${item.links.map(link => link.name ?? catalog?.items.find(feature => feature.id === link.feature_id)?.name ?? '').join(' ')}`.toLocaleLowerCase().includes(normalized))
  return <section aria-label={t('Funcionalidades')} className="flex min-w-0 flex-1 flex-col">
    <div className="mb-7 flex flex-wrap items-end gap-3">
      <div className="min-w-0 flex-1"><ProjectPicker scope={scope} onChange={value => { setParams(new URLSearchParams({ project: value })); setSearch('') }} /></div>
      <label className="input input-sm w-full sm:w-56"><Search size={15} aria-hidden="true" /><input aria-label={t('Buscar funcionalidades')} placeholder={t('Buscar funcionalidades…')} value={search} onChange={event => setSearch(event.target.value)} /></label>
      {live !== 'connected' && <IconButton label={t('Actualizar funcionalidades')} disabled={scope.loading || data.loading} onClick={() => { data.reload(); scope.reload() }}><RefreshCw size={16} /></IconButton>}
    </div>
    <header className="mb-7"><div className="flex items-center justify-between gap-3"><h1 className="font-serif text-3xl">{t('Funcionalidades')}</h1><AlphabeticSortButton descending={order.descending} onChange={order.setDescending}/></div><p className="mt-3 text-sm leading-relaxed text-base-content/55">{t('Consulta las funcionalidades, sus requerimientos y las propuestas pendientes de decisión.')}</p></header>
    {scope.loading || scope.error ? <DataMessage loading={scope.loading} error={t(scope.error)} onRetry={scope.reload} /> : !scope.projectId ? <DataMessage message={t('Selecciona un proyecto para consultar sus funcionalidades.')} /> : data.loading || data.error ? <DataMessage loading={data.loading} error={t(data.error)} onRetry={data.reload} /> : <div className="flex flex-col gap-10">
      <section aria-label={t('Propuestas de funcionalidades')}>
        <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-serif text-xl">{t('Propuestas de funcionalidades')}</h2><div className="w-44"><Dropdown label={t('Estado de propuesta')} value={status} options={Object.entries(statuses).map(([value, label]) => ({ value, label }))} onChange={setStatus} /></div></div>
        <ul className="mt-2 divide-y divide-base-300/60">{proposals.map(proposal => <li key={proposal.id} className="py-4"><Link className="break-words font-medium hover:underline" to={`/knowledge/features/proposals/${encodeURIComponent(proposal.id)}?${new URLSearchParams({project:scope.projectId})}`}>{proposal.requirement_title}</Link></li>)}</ul>
        {proposals.length === 0 && <p role="status" className="py-8 text-sm text-base-content/50">{t('No hay propuestas que coincidan con los filtros.')}</p>}
      </section>
      <section aria-label={t('Catálogo de funcionalidades')}>
        <h2 className="font-serif text-xl">{t('Catálogo de funcionalidades')} <span className="text-sm text-base-content/45">({features.length})</span></h2>
        <ul className="mt-2 divide-y divide-base-300/60">{features.map(feature => <li key={feature.id} className="flex items-center gap-3 py-4"><Layers3 size={18} className="shrink-0 text-base-content/40" aria-hidden="true"/><Link className="min-w-0 break-words font-medium hover:underline" to={`/knowledge/features/${encodeURIComponent(feature.id)}?${new URLSearchParams({project:scope.projectId})}`}>{feature.name}</Link></li>)}</ul>
        {features.length === 0 && <p role="status" className="py-8 text-sm text-base-content/50">{search ? t('No hay funcionalidades que coincidan con la búsqueda.') : t('Todavía no hay funcionalidades aprobadas.')}</p>}
      </section>
    </div>}

  </section>
}
