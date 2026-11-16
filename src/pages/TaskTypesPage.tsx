import AlphabeticSortButton from '../components/AlphabeticSortButton'
import {useAlphabeticOrder} from '../hooks/useAlphabeticOrder'
import {useContext} from 'react'
import {WorkspacePermissionsContext} from '../app/WorkspacePermissionsContext'
import { useNavigate } from 'react-router'
import { useTranslation } from '../hooks/useTranslation'
import TaskTypeGlyph from '../components/TaskTypeGlyph'
import { useLiveUpdates } from '../hooks/useLiveUpdates'
import { useState } from 'react'
import {
  Plus,
  Pencil,
  Archive,
  ArchiveRestore,
  Search,
  RefreshCw,
} from 'lucide-react'
import { useWorkCatalog } from '../hooks/useWorkCatalog'
import { parseCatalogTaskTypePage } from '../utils/parseCatalogTaskTypePage'
import IconButton from '../components/IconButton'
import DataMessage from '../components/DataMessage'
import TaskTypeArchiveModal from '../components/TaskTypeArchiveModal'
import type { CatalogTaskType } from '../types/CatalogTaskType'
export default function TaskTypesPage() {
 const order=useAlphabeticOrder()
  const { t } = useTranslation()
  const navigate=useNavigate()
  const manageable=useContext(WorkspacePermissionsContext)?.grants.some(g=>g.capability==='installation:manage'&&g.project_id===null)
  const live = useLiveUpdates(null)
  const catalog = useWorkCatalog('/api/v1/task-types', parseCatalogTaskTypePage)
  const [search, setSearch] = useState(''),
    [archiving, setArchiving] = useState<CatalogTaskType | null>(null)
  return (
    <section className="flex flex-1 flex-col" aria-label={t('Tipos de tareas')}>
      <h1 className="sr-only">{t('Tipos de tareas')}</h1>
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {manageable && <IconButton
          type="button"
          variant="primary"
          label={t('Crear tipo de tarea')}
          onClick={() => navigate('/settings/task-types/new')}
        >
          <Plus size={16} />
        </IconButton>}
        <label className="input input-sm ml-auto w-full sm:w-64">
          <Search size={15} />
          <input
            aria-label={t('Buscar tipos de tareas')}
            placeholder={t('Buscar tipos…')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label><AlphabeticSortButton descending={order.descending} onChange={order.setDescending}/>
        {live !== 'connected' && (
          <IconButton
            type="button"
            label={t('Actualizar tipos de tareas')}
            onClick={catalog.reload}
            disabled={catalog.loading}
          >
            <RefreshCw size={16} />
          </IconButton>
        )}
      </div>
      {catalog.loading || catalog.error ? (
        <DataMessage
          loading={catalog.loading}
          error={t(catalog.error)}
          onRetry={catalog.reload}
        />
      ) : (
        <>
          <ul className="divide-y divide-base-300">
            {[...catalog.items].sort((a,b)=>order.compare(a.name,b.name))
              .filter((t) =>
                `${t.name} ${t.code}`
                  .toLocaleLowerCase()
                  .includes(search.toLocaleLowerCase()),
              )
              .map((type) => (
                <li key={type.code} className="flex items-center gap-3 py-4">
                  <TaskTypeGlyph
                    code={type.code}
                    icon={type.icon}
                    color={type.color}
                  />
                  <div className="min-w-0 flex-1">
                    <h2
                      className={`text-sm font-semibold ${type.archived ? 'line-through text-base-content/40' : ''}`}
                    >
                      {type.name}
                    </h2>
                    <p className="text-xs text-base-content/40">
                      {type.code}
                      {type.archived ? t(' · Archivado') : ''}
                    </p>
                  </div>
                  {manageable && <><IconButton
                    type="button"
                    label={t('Editar {0}', { '0': type.name })}
                    onClick={() => navigate(`/settings/task-types/${encodeURIComponent(type.code)}/edit`)}
                  >
                    <Pencil size={15} />
                  </IconButton>
                  <IconButton
                    type="button"
                    label={`${type.archived ? t('Restaurar') : t('Archivar')} ${type.name}`}
                    onClick={() => setArchiving(type)}
                  >
                    {type.archived ? (
                      <ArchiveRestore size={15} />
                    ) : (
                      <Archive size={15} />
                    )}
                  </IconButton></>}
                </li>
              ))}
          </ul>
          {!catalog.items.length && (
            <DataMessage
              message={t('Todavía no hay tipos de tarea en el catálogo.')}
            />
          )}
        </>
      )}
      {archiving && (
        <TaskTypeArchiveModal
          type={archiving}
          onClose={() => setArchiving(null)}
          onSaved={() => {
            setArchiving(null)
            catalog.reload()
          }}
        />
      )}
    </section>
  )
}
