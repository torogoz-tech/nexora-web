import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { Plus, RefreshCw, Search } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { parseProducts } from '../utils/parseProducts'
import { parseServiceRequestPage } from '../utils/parseServiceRequestPage'
import { parseServiceRequestTypes } from '../utils/parseServiceRequestTypes'
import { requestCriticalities } from '../utils/requestCriticalities'
import { serviceRequestStatus } from '../utils/serviceRequestStatus'
import Pagination from '../components/Pagination'
import RequestSlaIndicator from '../components/RequestSlaIndicator'
import RequestTypeGlyph from '../components/RequestTypeGlyph'
import DataMessage from '../components/DataMessage'
import Dropdown from '../components/Dropdown'
import IconButton from '../components/IconButton'
import AlphabeticSortButton from '../components/AlphabeticSortButton'

export default function ServiceRequestsPage() {
  const { t, dateLocale } = useTranslation()
  const [params, setParams] = useSearchParams()
  const [search, setSearch] = useState(params.get('search') ?? '')
  const page = Math.max(1, Number(params.get('page')) || 1)
  const status = params.get('status') ?? ''
  const product = params.get('product') ?? ''
  const type = params.get('type') ?? ''
  const criticality = params.get('criticality') ?? ''
  const descending = params.get('order') === 'desc'
  const products = useApiData('/api/v1/requests/products', parseProducts)
  const types = useApiData('/api/v1/requests/types', parseServiceRequestTypes)
  const query = new URLSearchParams({ search: params.get('search') ?? '', status, type_id: type, product_id: product, criticality, order: descending ? 'desc' : 'asc', page: String(page) })
  const data = useApiData(`/api/v1/requests?${query}`, parseServiceRequestPage)
  const filter = (key: string, value: string) => { const next = new URLSearchParams(params); next.delete('page'); if (value) next.set(key, value); else next.delete(key); setParams(next) }
  const refresh = () => { products.reload(); types.reload(); data.reload() }
  const activeTypes = types.data?.items.filter(item => !item.archived) ?? []
  return <section aria-label={t('Listado de solicitudes')} className="@container/request-list flex min-w-0 flex-1 flex-col p-4 sm:p-6">
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3"><div className="flex min-w-0 items-center gap-3"><h1 className="truncate text-xl font-semibold">{t('Solicitudes')}</h1>{data.data && <span className="rounded-lg bg-base-200 px-2 py-1 text-xs tabular-nums text-base-content/55" aria-label={`${data.data.total} solicitudes en el listado`}>{data.data.total}</span>}</div><div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto"><Dropdown className="w-48" label={t('Filtrar por producto')} value={product} onChange={value => filter('product', value)} searchable options={[{ value: '', label: t('Todos los productos') }, ...products.data?.items.filter(item => !item.archived).map(item => ({ value: item.id, label: item.name })) ?? []]} /><Dropdown className="w-44" label={t('Filtrar por tipo')} value={type} onChange={value => filter('type', value)} searchable options={[{ value: '', label: t('Todos los tipos') }, ...activeTypes.map(item => ({ value: item.id, label: t(item.name) }))]} /><Dropdown className="w-36" label={t('Filtrar por estado')} value={status} onChange={value => filter('status', value)} options={[{ value: '', label: t('Todos los estados') }, ...['new', 'in_progress', 'completed'].map(value => ({ value, label: t(serviceRequestStatus(value)) }))]} /><Dropdown className="w-40" label={t('Filtrar por criticidad')} value={criticality} onChange={value => filter('criticality', value)} options={[{ value: '', label: t('Todas las criticidades') }, ...requestCriticalities.map(item => ({ value: item.value, label: t(item.label) }))]} /><Link to="/requests/new" className="btn btn-sm btn-primary btn-square" aria-label={t('Nueva solicitud')}><Plus size={16} /></Link><label className="input input-sm min-w-0 flex-1 sm:w-60"><Search size={15} /><input aria-label={t('Buscar solicitudes')} placeholder={t('Buscar solicitudes…')} value={search} onChange={event => { setSearch(event.target.value); const next = new URLSearchParams(params); next.delete('page'); if (event.target.value) next.set('search', event.target.value); else next.delete('search'); setParams(next, { replace: true }) }} /></label><AlphabeticSortButton descending={descending} onChange={value => { const next = new URLSearchParams(params); next.delete('page'); next.set('order', value ? 'desc' : 'asc'); setParams(next) }} /><IconButton label={t('Actualizar solicitudes')} disabled={data.loading} onClick={refresh}><RefreshCw size={16} /></IconButton></div></header>
    {data.loading || data.error ? <DataMessage loading={data.loading} error={t(data.error)} onRetry={refresh} /> : data.data?.items.length ? <><div className="min-w-0 overflow-x-auto"><table className="table table-sm w-full"><thead><tr><th>{t('Solicitud')}</th><th>{t('Producto')}</th><th>{t('Solicitante')}</th><th>{t('Estado')}</th><th>{t('SLA')}</th><th>{t('Criticidad')}</th></tr></thead><tbody>{data.data.items.map(item => <tr key={item.id}><td className="min-w-56"><div className="flex items-center gap-3"><RequestTypeGlyph icon={item.type_icon} color={item.type_color} /><div className="min-w-0"><p className="max-w-sm break-words font-medium"><Link className="hover:underline" to={`/requests/${item.id}`}>#{item.number} · {item.title}</Link></p><p className="mt-1 text-xs text-base-content/45">{t(item.type_name ?? item.type_id)} · <time dateTime={item.created_at}>{new Date(item.created_at).toLocaleString(dateLocale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time></p></div></div></td><td className="min-w-32 text-base-content/60">{item.product_name ?? t('Sin producto')}</td><td className="min-w-32 text-base-content/60">{item.requester_name ?? t('Sin solicitante')}</td><td><span className={`badge badge-soft ${item.status === 'completed' ? 'badge-success' : item.status === 'in_progress' ? 'badge-info' : 'badge-neutral'}`}>{t(serviceRequestStatus(item.status))}</span></td><td className="min-w-32"><RequestSlaIndicator request={item} /></td><td><span className={`badge badge-soft ${requestCriticalities.find(value => value.value === item.criticality)?.badge ?? 'badge-warning'}`}>{t(requestCriticalities.find(value => value.value === item.criticality)?.label ?? 'Media')}</span></td></tr>)}</tbody></table></div><Pagination compact page={page} count={data.data.items.length} total={data.data.total} totalPages={Math.ceil(data.data.total / 20)} hasNext={page * 20 < data.data.total} busy={data.loading} onPrevious={() => { const next = new URLSearchParams(params); next.set('page', String(page - 1)); setParams(next) }} onNext={() => { const next = new URLSearchParams(params); next.set('page', String(page + 1)); setParams(next) }} onPage={value => { const next = new URLSearchParams(params); next.set('page', String(value)); setParams(next) }} /></> : <DataMessage message={search ? t('No hay solicitudes que coincidan con tu búsqueda.') : t('No hay solicitudes que coincidan con los filtros.')} />}
  </section>
}
