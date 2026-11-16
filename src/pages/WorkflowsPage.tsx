import Pagination from '../components/Pagination'
import {useWorkCatalog} from '../hooks/useWorkCatalog'
import AlphabeticSortButton from '../components/AlphabeticSortButton'
import {useAlphabeticOrder} from '../hooks/useAlphabeticOrder'
import { useTranslation } from '../hooks/useTranslation'
import IconButton from '../components/IconButton'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  Plus,
  Search,
  RefreshCw,
  History,
  Archive,
  ArchiveRestore,
  UsersRound,
} from 'lucide-react'
import { parseWorkflowPage } from '../utils/parseWorkflowPage'
import RowAction from '../components/RowAction'
import WorkflowArchiveModal from '../components/WorkflowArchiveModal'
import WorkflowDevelopersModal from '../components/WorkflowDevelopersModal'
import DataMessage from '../components/DataMessage'
import WorkflowSymbol from '../components/WorkflowSymbol'
import type { WorkflowSummary } from '../types/WorkflowSummary'
export default function WorkflowsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [search, setSearch] = useState(''),
    [archiving, setArchiving] = useState<WorkflowSummary | null>(null),
    [members, setMembers] = useState<WorkflowSummary | null>(null)
  const order=useAlphabeticOrder(),[page,setPage]=useState(1)
  const data=useWorkCatalog('/api/v1/workflows?include_archived=true',parseWorkflowPage)
  const visible =
    data.items.filter((workflow) =>
      workflow.name
        .toLocaleLowerCase()
        .includes(search.trim().toLocaleLowerCase()),
    ).sort((a,b)=>order.compare(a.name,b.name))
  return (
    <section className="flex flex-1 flex-col" aria-label="Workflows">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <IconButton
          type="button"
          variant="primary"
          onClick={() => navigate('/settings/workflows/new')}
          label={t('Crear workflow')}
        >
          <Plus size={15} />
        </IconButton>
        <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
          <label className="input input-sm w-full sm:w-48">
            <Search size={15} />
            <input
              aria-label={t('Buscar workflows')}
              placeholder={t('Buscar workflows…')}
              value={search}
              onChange={(event) => {setPage(1);setSearch(event.target.value)}}
            />
          </label><AlphabeticSortButton descending={order.descending} onChange={value=>{order.setDescending(value);setPage(1)}}/>
          <IconButton
            type="button"
            variant="ghost"
            disabled={data.loading}
            onClick={data.reload}
            label={t('Actualizar workflows')}
          >
            <RefreshCw size={15} />
          </IconButton>
        </div>
      </div>
      {data.loading || data.error ? (
        <DataMessage
          loading={data.loading}
          error={t(data.error)}
          onRetry={data.reload}
        />
      ) : visible.length === 0 ? (
        <p
          role="status"
          className="py-12 text-center text-sm text-base-content/50"
        >
          {search
            ? t(
                'No hay workflows que coincidan con tu búsqueda en esta página.',
              )
            : t('Todavía no hay workflows en esta página.')}
        </p>
      ) : (
        <ul className="divide-y divide-base-300">
          {visible.slice((page-1)*20,page*20).map((workflow) => (
            <li
              key={workflow.id}
              className="flex flex-wrap items-center gap-3 border-l-2 py-5 pl-3"
              style={{ borderLeftColor: workflow.color ?? 'transparent' }}
            >
              <WorkflowSymbol icon={workflow.icon} color={workflow.color} size={20} className="shrink-0 text-base-content/45" />
              <Link
                className="min-w-0 flex-1 rounded-lg"
                to={`/settings/workflows/${encodeURIComponent(workflow.id)}`}
              >
                <span
                  className={`block break-words text-sm font-semibold ${workflow.archived ? 'text-base-content/40 line-through' : ''}`}
                >
                  {workflow.name}
                </span>
                <span className="mt-1 block text-xs text-base-content/45">
                  {workflow.archived
                    ? t('Archivado')
                    : workflow.latest_version_number
                      ? t('Publicada v{0}', {
                          '0': workflow.latest_version_number,
                        })
                      : t('Borrador')}
                </span>
              </Link>
              <RowAction
                label={t('Desarrolladores')}
                onClick={() => setMembers(workflow)}
              >
                <UsersRound size={16} aria-hidden="true" />
              </RowAction>
              <RowAction
                label={t('Versiones publicadas')}
                to={`/settings/workflows/${encodeURIComponent(workflow.id)}/versions`}
              >
                <History size={16} aria-hidden="true" />
              </RowAction>
              <RowAction
                label={workflow.archived ? t('Restaurar') : t('Archivar')}
                onClick={() => setArchiving(workflow)}
              >
                {workflow.archived ? (
                  <ArchiveRestore size={16} aria-hidden="true" />
                ) : (
                  <Archive size={16} aria-hidden="true" />
                )}
              </RowAction>
            </li>
          ))}
        </ul>
      )}
      <Pagination page={page} count={Math.min(20,Math.max(0,visible.length-(page-1)*20))} total={visible.length} hasNext={page*20<visible.length} onPrevious={()=>setPage(page-1)} onNext={()=>setPage(page+1)}/>
      {archiving && (
        <WorkflowArchiveModal
          workflow={archiving}
          onClose={() => setArchiving(null)}
          onChanged={data.reload}
        />
      )}
      {members && (
        <WorkflowDevelopersModal
          workflow={members}
          onClose={() => setMembers(null)}
        />
      )}
    </section>
  )
}
