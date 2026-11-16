import AlphabeticSortButton from '../components/AlphabeticSortButton'
import {useAlphabeticOrder} from '../hooks/useAlphabeticOrder'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { useTranslation } from '../hooks/useTranslation'
import IconButton from '../components/IconButton'
import ProjectRow from '../components/ProjectRow'
import EditProjectModal from '../components/EditProjectModal'
import ArchiveProjectModal from '../components/ArchiveProjectModal'
import type { Project } from '../types/Project'
import { useContext, useState, useEffect } from 'react'
import {
  ChevronRight,
  FolderKanban,
  LockKeyhole,
  RefreshCw,
  Search,
  Plus,
} from 'lucide-react'
import CreateProjectModal from '../components/CreateProjectModal'
import { useProjects } from '../hooks/useProjects'

export default function ProjectsPage() {
 const order=useAlphabeticOrder()
  const { t } = useTranslation()
  const permissions = useContext(WorkspacePermissionsContext)
  const canCreate = permissions?.grants.some(g => g.capability === 'projects:write' && g.project_id === null) ?? false
  const canManage = (id: string) => permissions?.role !== 'technical_lead' && (permissions?.grants.some(g => g.capability === 'projects:write' && (g.project_id === null || g.project_id === id)) ?? false)
  const {
    projects,
    status,
    hasMore,
    retry,
    addProject,
    loadMore,
    loadingMore,
    pageError,
  } = useProjects()
  useEffect(()=>{if(status==='ready'&&hasMore&&!loadingMore&&!pageError)void loadMore()},[status,hasMore,loadingMore,pageError,loadMore])
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)
  const [archiving, setArchiving] = useState<Project | null>(null)

  const isUnauthorized = status === 'authentication-required'
  const available = [...projects].sort((a,b)=>order.compare(a.name,b.name))
  const visible = available.filter((project) =>
    project.name.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
  )
  return (
    <section className="flex flex-1 flex-col" aria-label={t('Proyectos')}>
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4"><AlphabeticSortButton descending={order.descending} onChange={order.setDescending}/>
        {canCreate && <IconButton
          type="button"
          disabled={status === 'loading'}
          variant="primary"
          onClick={() => setCreateOpen(true)}
          label={t('Crear proyecto')}
        >
          <Plus size={16} aria-hidden="true" />
        </IconButton>}
        <div className="flex w-full items-center gap-2 sm:ml-auto sm:w-auto">
          <label className="input input-sm w-full sm:w-64">
            <Search size={15} aria-hidden="true" />
            <input
              aria-label={t('Buscar proyectos')}
              placeholder={t('Buscar proyectos…')}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              disabled={status !== 'ready'}
            />
          </label>
          <IconButton
            type="button"
            variant="ghost"
            disabled={status === 'loading' || loadingMore}
            onClick={retry}
            label={t('Actualizar proyectos')}
          >
            <RefreshCw size={15} aria-hidden="true" />
          </IconButton>
        </div>
      </div>
      {status === 'ready' && available.length > 0 ? (
        <>
          <ul className="divide-y divide-base-300">
            {visible.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                canManage={canManage(project.id)}
                onEdit={setEditing}
                onArchive={setArchiving}
              />
            ))}
          </ul>
          {visible.length === 0 && (
            <p
              className="py-12 text-center text-sm text-base-content/50"
              role="status"
            >
              {' '}
              {t('No hay proyectos que coincidan con tu búsqueda.')}{' '}
            </p>
          )}
        </>
      ) : (
        <div
          className="flex flex-1 items-center justify-center py-16"
          role="status"
          aria-live="polite"
        >
          <div className="max-w-sm text-center">
            <div className="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl border border-base-300 bg-base-200">
              {status === 'loading' ? (
                <span className="loading loading-spinner loading-sm motion-reduce:animate-none" />
              ) : isUnauthorized ? (
                <LockKeyhole
                  size={23}
                  className="text-base-content/50"
                  aria-hidden="true"
                />
              ) : (
                <FolderKanban
                  size={23}
                  className="text-base-content/50"
                  aria-hidden="true"
                />
              )}
            </div>
            <h2 className="text-lg font-medium">
              {status === 'loading'
                ? t('Cargando proyectos')
                : isUnauthorized
                  ? t('Tu espacio comienza con una sesión')
                  : status === 'access-denied'
                    ? t('No tienes acceso a los proyectos')
                    : status === 'ready'
                      ? t('Aún no hay proyectos')
                      : t('No pudimos cargar los proyectos')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-base-content/50">
              {isUnauthorized
                ? t('Tu sesión ya no está disponible. Vuelve a iniciar sesión.')
                : status === 'loading'
                  ? t('Consultando tu espacio en Nexora…')
                  : status === 'ready'
                    ? t('Los proyectos de tu equipo aparecerán aquí.')
                    : status === 'access-denied'
                      ? t(
                          'La cuenta necesita permisos para consultar este espacio.',
                        )
                      : t('Revisa la conexión y vuelve a intentarlo.')}
            </p>
            {status !== 'loading' && status !== 'ready' && (
              <IconButton
                type="button"
                variant="outline"
                className="mt-6"
                onClick={retry}
                label="Volver a consultar"
              >
                <RefreshCw size={14} aria-hidden="true" />
              </IconButton>
            )}
          </div>
        </div>
      )}
      {pageError && (
        <p role="alert" className="mt-4 text-sm text-error">
          {t(pageError)}
        </p>
      )}
      {hasMore && status === 'ready' && (
        <div className="mt-4 flex justify-center">
          <IconButton
            type="button"
            variant="outline"
            disabled={loadingMore}
            onClick={() => void loadMore()}
            label={loadingMore ? t('Cargando…') : t('Cargar más proyectos')}
            aria-busy={loadingMore}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </IconButton>
        </div>
      )}
      {editing && (
        <EditProjectModal
          key={`${editing.id}-${editing.revision}`}
          project={editing}
          onClose={() => setEditing(null)}
          onSaved={(project) => {
            addProject(project)
            setEditing(null)
          }}
        />
      )}
      {archiving && (
        <ArchiveProjectModal
          key={`${archiving.id}-${archiving.revision}`}
          project={archiving}
          onClose={() => setArchiving(null)}
          onSaved={(project) => {
            addProject(project)
            setArchiving(null)
          }}
        />
      )}
      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(project) => {
          addProject(project)
          setSearch('')
          setCreateOpen(false)
        }}
      />
    </section>
  )
}
