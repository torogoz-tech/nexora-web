import { useProjectPreference } from '../hooks/useProjectPreference'
import TaskQuickAssignment from '../components/TaskQuickAssignment'
import TaskPriorityBadge from '../components/TaskPriorityBadge'
import TaskStatusBadges from '../components/TaskStatusBadges'
import AlphabeticSortButton from '../components/AlphabeticSortButton'
import {useProjects} from '../hooks/useProjects'
import TaskCreatorIdentity from '../components/TaskCreatorIdentity'
import { taskDetailPath } from '../utils/taskDetailPath'
import Pagination from '../components/Pagination'
import { useUrlCursorPagination } from '../hooks/useUrlCursorPagination'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { useTranslation } from '../hooks/useTranslation'
import { useContext } from 'react'
import { useSearchParams, useLocation, useNavigate, Link } from 'react-router'
import {
  Plus,
  RefreshCw,
  Search,
  LockKeyhole,
} from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useWorkNavigation } from '../hooks/useWorkNavigation'
import { parseVisibleTaskPage } from '../utils/parseVisibleTaskPage'
import { getTaskTypeIcon } from '../utils/getTaskTypeIcon'
import IconButton from '../components/IconButton'
import Dropdown from '../components/Dropdown'
import DataMessage from '../components/DataMessage'
export default function TasksPage() {
  const projects=useProjects()
  const paging=useUrlCursorPagination()
  const { t, dateLocale } = useTranslation()
  const permissions = useContext(WorkspacePermissionsContext), location = useLocation(), navigate = useNavigate()
  const [params, setParams] = useSearchParams(),
    { types } = useWorkNavigation()
  const selectedProject = useProjectPreference(params.get('project'))
  const projectId = selectedProject === 'organization' ? '' : selectedProject ?? ''
  const code = params.get('type'),
    search = params.get('q') ?? '',
    after = paging.after
  const query = new URLSearchParams({
    limit: '20',
    descending: String(params.get('order')==='desc'),
    ...(projectId ? {project_id:projectId} : {}),
    ...(params.get('assignee')?{assignee_id:params.get('assignee')!}:{}),
    ...(code ? { type_code: code } : {}),
    ...(search ? { search } : {}),
    ...(after ? { after } : {}),
    ...(params.get('lifecycle') ? { lifecycle: params.get('lifecycle')! } : {}),
  })
  const data = useApiData(`/api/v1/tasks?${query}`, parseVisibleTaskPage)
  const allPeople=useApiData('/api/v1/tasks?limit=1',parseVisibleTaskPage)
  const people=allPeople.data?.participants?.map(p=>({value:p.actor_id,label:p.name}))??[]
  const filter=(key:string,value:string)=>{const next=new URLSearchParams(params);next.delete('after');if(value || key==='project')next.set(key,value);else next.delete(key);setParams(next)}
  const selectedType = types.items.find((type) => type.code === code)
  const refresh = () => {
    data.reload()
    types.reload()
    allPeople.reload()
  }
  return (
    <section
      aria-label={t('Listado de tareas')}
      className="@container/task-list flex min-w-0 flex-1 flex-col p-4 sm:p-6"
    >
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <h1 className="truncate text-xl font-semibold">
            {code ? (selectedType?.name ?? code) : t('Tareas')}
          </h1>
          {data.data && (
            <span
              className="rounded-lg bg-base-200 px-2 py-1 text-xs tabular-nums text-base-content/55"
              aria-label={`${data.data.total} tareas en el listado`}
            >
              {data.data.total}
            </span>
          )}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 sm:ml-auto sm:w-auto">
          <Dropdown className="w-48" label={t('Filtrar por proyecto')} value={projectId} onChange={value=>filter('project',value)} options={[{value:'',label:t('Todos los proyectos')},{value:'none',label:t('Sin proyecto')},...projects.projects.map(p=>({value:p.id,label:p.name}))]}/>
          {projects.hasMore&&<button type="button" className="btn btn-sm btn-ghost" disabled={projects.loadingMore} onClick={()=>void projects.loadMore()}>{t('Más proyectos')}</button>}
          <Dropdown className="w-44" label={t('Filtrar por responsable')} value={params.get('assignee')??''} onChange={value=>filter('assignee',value)} options={[{value:'',label:t('Todos los responsables')},{value:'none',label:t('Sin responsable')},...people]}/>
          <Dropdown className="w-36 shrink-0" label={t('Ciclo de vida')} value={params.get('lifecycle') ?? ''} onChange={value => { const next = new URLSearchParams(params); next.delete('after'); if (value) next.set('lifecycle', value); else next.delete('lifecycle'); setParams(next) }} options={[{value:'',label:t('Todas las tareas')},{value:'pending',label:t('Pendientes')},{value:'active',label:t('En ejecución')},{value:'paused',label:t('En pausa')},{value:'completed',label:t('Completadas')}]}/>

          <AlphabeticSortButton descending={params.get('order')==='desc'} onChange={value=>filter('order',value?'desc':'asc')}/>
          {permissions?.role && <IconButton type="button" label={t('Crear tarea')} variant="primary" onClick={() => navigate(`/tasks/new?${new URLSearchParams({ ...(code ? { type:code } : {}), ...(projectId && projectId !== 'none' ? {project:projectId} : {}), returnTo:location.pathname + location.search })}`)}><Plus size={16}/></IconButton>}
          <label className="input input-sm min-w-0 flex-1 sm:w-60">
            <Search size={15} />
            <input
              aria-label={t('Buscar tareas')}
              placeholder={t('Buscar tareas…')}
              value={search}
              onChange={(event) => {
                const next = new URLSearchParams(params)
                next.delete('after')
                if (event.target.value) next.set('q', event.target.value)
                else next.delete('q')
                setParams(next, { replace: true })
              }}
            />
          </label>
          <IconButton
            type="button"
            label={t('Actualizar tareas')}
            disabled={data.loading}
            onClick={refresh}
          >
            <RefreshCw size={16} />
          </IconButton>
        </div>
      </header>
      {data.loading || data.error ? (
        <DataMessage
          loading={data.loading}
          error={t(data.error)}
          onRetry={refresh}
        />
      ) : data.data?.items.length ? (
        <>
          <div className="min-w-0 overflow-x-auto">
            <table className="table table-sm w-full">
              <thead>
                <tr>
                  <th>{t('Tarea')}</th>
                  <th>{t('Proyecto')}</th>
                  <th>{t('Responsable')}</th><th>{t('Creada por')}</th>
                  <th>{t('Estado')}</th>
                  <th>{t('Prioridad')}</th>
                </tr>
              </thead>
              <tbody>
                {data.data.items.map((task) => {
                  const Icon = getTaskTypeIcon(task.type_code, task.type_icon)
                  return (
                    <tr key={task.id}>
                      <td className="min-w-52">
                        <div className="flex items-center gap-3">
                          <Icon
                            size={16}
                            className="shrink-0"
                            style={{color:types.items.find(type=>type.code===task.type_code)?.color ?? undefined}}
                          />
                          <div>
                            <p className="max-w-sm break-words font-medium">
                              <Link className="hover:underline" to={taskDetailPath(task.id,location.pathname + location.search)}>{task.title}</Link>
                            </p>
                            {task.state_changed_at && <time className="mt-1 block text-xs text-base-content/45" dateTime={task.state_changed_at} title={t('Último cambio de estado')}>{new Date(task.state_changed_at).toLocaleString(dateLocale, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</time>}
                            <p className="mt-1 text-xs text-base-content/40">
                              {!!task.subtasks_total && <span className="ml-2">{t('Subtareas')}: {task.subtasks_completed ?? 0}/{task.subtasks_total}</span>}
                              {(task.blocked || (task.blocking_count ?? 0) > 0) && (
                                <span className="ml-2 inline-flex items-center gap-1">
                                  <LockKeyhole size={11} />{' '}
                                  {t('Bloqueada')}{' '}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="min-w-32 text-base-content/60">
                        {task.project_id?<Link className="hover:underline" to={`/projects/${encodeURIComponent(task.project_id)}`}>{task.project_name??t('Proyecto')}</Link>:t('Sin proyecto')}
                      </td>
                      <td className="w-12 text-base-content/60 @min-[1100px]/task-list:w-auto @min-[1100px]/task-list:min-w-32">
                        {task.assignee_id?<TaskCreatorIdentity compact creator={task.assignee ?? undefined} resolveProfile={false} actorId={task.assignee_id} name={task.assignee_name}/>:<TaskQuickAssignment task={task} onChanged={refresh}/>}
                      </td>
                      <td className="w-12 text-base-content/60 @min-[1100px]/task-list:w-auto @min-[1100px]/task-list:min-w-32"><TaskCreatorIdentity compact creator={task.creator ?? undefined} resolveProfile={false} actorId={task.created_by} name={task.created_by_name}/></td>
                      <td className="min-w-28">
                        <TaskStatusBadges task={task}/>
                      </td>
                      <td><TaskPriorityBadge priority={task.priority}/></td>

                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
      <Pagination page={paging.page} hasPrevious={paging.hasPrevious} count={data.data.items.length} total={data.data.total} busy={data.loading} hasNext={!!data.data?.next_after} onPrevious={paging.previous} onNext={()=>{if(data.data?.next_after)paging.next(data.data.next_after)}}/>
        </>
      ) : (
        <DataMessage
          message={
            search
              ? t('No hay tareas visibles que coincidan con tu búsqueda.')
              : t('No hay tareas visibles en esta categoría.')
          }
        />
      )}
    </section>
  )
}
