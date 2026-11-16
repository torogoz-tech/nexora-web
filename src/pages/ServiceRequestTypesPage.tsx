import { useState } from 'react'
import { Link } from 'react-router'
import { Plus, Archive, ArchiveRestore, RefreshCw, Search } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { useAlphabeticOrder } from '../hooks/useAlphabeticOrder'
import { parseServiceRequestTypes } from '../utils/parseServiceRequestTypes'
import { writeServiceRequest } from '../services/writeServiceRequest'
import AlphabeticSortButton from '../components/AlphabeticSortButton'
import DataMessage from '../components/DataMessage'
import IconButton from '../components/IconButton'
import RequestTypeGlyph from '../components/RequestTypeGlyph'
export default function ServiceRequestTypesPage() {
  const { t } = useTranslation()
  const remote = useApiData('/api/v1/requests/types', parseServiceRequestTypes)
  const order = useAlphabeticOrder()
  const [search, setSearch] = useState(''), [error, setError] = useState(''), [busy, setBusy] = useState(false)
  async function archive(id: string) {
    const item = remote.data?.items.find(item => item.id === id)
    if (!item) return
    setBusy(true); setError('')
    try { await writeServiceRequest('/api/v1/requests/types', { id, name: item.name, archived: !item.archived, expected_revision: item.revision }); remote.reload() }
    catch (e) { setError(e instanceof Error ? e.message : String(e)) }
    finally { setBusy(false) }
  }
  return <section className="min-w-0 flex-1 pb-12" aria-label={t('Tipos de solicitudes')}>
    <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-semibold">{t('Tipos de solicitudes')}</h1>
      <div className="flex items-center gap-2">{remote.data?.can_manage && <Link to="/settings/request-types/new" className="btn btn-sm" aria-label={t('Crear tipo')}><Plus size={16}/>{t('Crear tipo')}</Link>}<AlphabeticSortButton descending={order.descending} onChange={order.setDescending}/><IconButton label={t('Actualizar')} onClick={remote.reload}><RefreshCw size={16}/></IconButton></div>
    </header>
    <label className="input input-sm mb-5 flex w-full items-center gap-2"><Search size={16}/><input aria-label={t('Buscar tipos de solicitudes')} placeholder={t('Buscar tipos…')} value={search} onChange={e => setSearch(e.target.value)}/></label>
    <DataMessage loading={remote.loading} error={remote.error ?? error} onRetry={remote.reload}/>
    <ul className="divide-y divide-base-300">{[...(remote.data?.items ?? [])].sort((a,b) => order.compare(a.name,b.name)).filter(item => item.name.toLocaleLowerCase().includes(search.toLocaleLowerCase())).map(item => <li key={item.id} className="flex min-w-0 items-center gap-3 py-4">
      <RequestTypeGlyph icon={item.icon} color={item.color}/><div className="min-w-0 flex-1">{remote.data?.can_manage ? <Link to={`/settings/request-types/${encodeURIComponent(item.id)}/edit`} className="text-sm font-semibold hover:underline">{t(item.name)}</Link> : <h2 className="text-sm font-semibold">{t(item.name)}</h2>}<p className="mt-1 text-xs text-base-content/50">{Object.keys(item.sla).length} {t('niveles de SLA configurados')}{item.archived ? ` · ${t('Archivado')}` : ''}</p></div>
      {remote.data?.can_manage && <IconButton label={t(item.archived ? 'Restaurar' : 'Archivar')} disabled={busy} onClick={() => void archive(item.id)}>{item.archived ? <ArchiveRestore size={16}/> : <Archive size={16}/>}</IconButton>}
    </li>)}</ul>
  </section>
}
