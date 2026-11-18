import ReleaseComposition from '../components/ReleaseComposition'
import { useContext, useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { useTranslation } from '../hooks/useTranslation'
import { useProjectScope } from '../hooks/useProjectScope'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { apiFetch } from '../services/apiFetch'
import { parseTaskReleases } from '../utils/parseTaskReleases'
import { parseTaskRelease } from '../utils/parseTaskRelease'
import { parseVisibleTaskPage } from '../utils/parseVisibleTaskPage'
import { parseRepositoryPage } from '../utils/parseRepositoryPage'
import ProjectPicker from '../components/ProjectPicker'
import DataMessage from '../components/DataMessage'

export default function ReleasesPage() {
  const { t } = useTranslation()
  const scope = useProjectScope()
  const [params, setParams] = useSearchParams()
  const permissions = useContext(WorkspacePermissionsContext)
  const mutation = useIntegrationMutation()
  const [version, setVersion] = useState('')
  const [branch, setBranch] = useState('release/')
  const [selected, setSelected] = useState<{ id: string; revision: number }[]>([])
  const [search, setSearch] = useState('')
  const [heads, setHeads] = useState<Record<string, string>>({})
  const base = scope.projectId
    ? `/api/v1/projects/${encodeURIComponent(scope.projectId)}/releases`
    : null
  const releaseId = params.get('release')
  const releases = useApiData(base, parseTaskReleases)
  const detail = useApiData(
    base && releaseId ? `${base}/${encodeURIComponent(releaseId)}` : null,
    parseTaskRelease,
  )
  const tasks = useApiData(
    scope.projectId
      ? `/api/v1/tasks?${new URLSearchParams({ project_id: scope.projectId, lifecycle: 'active', limit: '100', search })}`
      : null,
    parseVisibleTaskPage,
  )
  const repositories = useApiData(
    scope.projectId
      ? `/api/v1/projects/${encodeURIComponent(scope.projectId)}/repositories?limit=100`
      : null,
    parseRepositoryPage,
  )
  const canPrepare =
    ['technical_lead', 'manager', 'super_admin'].includes(permissions?.role ?? '') &&
    permissions?.grants.some(
      (grant) =>
        grant.capability === 'tasks:write' &&
        (grant.project_id === null || grant.project_id === scope.projectId),
    )
  const current = detail.data
  const canChange = canPrepare && (!releaseId || current?.status === 'prepared')
  const available = (tasks.data?.items ?? []).filter(
    (task) =>
      !current?.tasks?.some((item) => item.task_id === task.id) &&
      !!task.workflow_id,
  )

  const choose = (id: string) =>
    setSelected((values) =>
      values.some((value) => value.id === id)
        ? values.filter((value) => value.id !== id)
        : [...values, { id, revision: available.find((task) => task.id === id)!.revision }],
    )

  const save = () => {
    if (!base) return
    const input = {
      ...(releaseId
        ? { expected_revision: current?.revision }
        : { version: version.trim(), branch_name: branch.trim() }),
      tasks: selected.map((task) => ({ task_id: task.id, expected_revision: task.revision })),
      repositories: Object.entries(heads)
        .filter(([, head]) => head.trim())
        .map(([repository_id]) => ({ repository_id })),
    }
    void mutation.run(
      { project: scope.projectId, release: releaseId, input },
      async (signal, key) => {
        const response = await apiFetch(
          `${base}${releaseId ? `/${encodeURIComponent(releaseId)}/tasks` : ''}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key },
            body: JSON.stringify(input),
            signal,
          },
        )
        if (!response.ok)
          throw Error(
            response.status === 409
              ? 'Las tareas o la publicación cambiaron. Actualiza y revisa la selección.'
              : 'No pudimos preparar la publicación. Revisa las etapas terminadas, los repositorios y las revisiones.',
          )
        const created = parseTaskRelease(await response.json())
        setParams(new URLSearchParams({ project: scope.projectId, release: created.id }))
        setSelected([])
        setHeads({})
        releases.reload()
        detail.reload()
      },
    )
  }

  const selectProject = (project: string) => {
    setSelected([])
    setHeads({})
    setVersion('')
    setBranch('release/')
    setParams(new URLSearchParams({ project }))
  }

  return (
    <section className="flex min-w-0 flex-1 flex-col" aria-label={t('Publicaciones')}>
      <ProjectPicker scope={scope} onChange={selectProject} />
      <h1 className="mb-3 mt-6 font-serif text-3xl">{t('Publicaciones')}</h1>
      <p className="mb-6 text-sm text-base-content/60">
        {t('Selecciona cambios concretos para una versión. Las tareas se completan al verificar su despliegue en producción.')}
      </p>
      <DataMessage
        loading={scope.loading || releases.loading}
        error={scope.error ?? releases.error}
        onRetry={() => {
          scope.reload()
          releases.reload()
        }}
      />
      {scope.projectId && (
        <div className="grid min-w-0 gap-7 xl:grid-cols-[15rem_minmax(0,1fr)]">
          <aside className="min-w-0">
            <button
              className="btn btn-sm btn-ghost mb-3"
              onClick={() => {
                setSelected([])
                setHeads({})
                setParams(new URLSearchParams({ project: scope.projectId }))
              }}
            >
              {t('Nueva publicación')}
            </button>
            <ul className="space-y-2">
              {releases.data?.items.map((release) => (
                <li key={release.id}>
                  <Link
                    className={`block rounded-lg px-3 py-3 hover:bg-base-200 ${release.id === releaseId ? 'bg-base-200' : ''}`}
                    to={`/code/releases?${new URLSearchParams({ project: scope.projectId, release: release.id })}`}
                    onClick={() => {
                      setSelected([])
                      setHeads({})
                    }}
                  >
                    <strong className="break-all">{release.version}</strong>
                    <span className="mt-1 block text-xs text-base-content/55">
                      {t(release.status === 'published' ? 'Publicada en producción' : 'Preparada')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </aside>
          <div className="min-w-0">
            {releaseId && (
              <>
                <DataMessage loading={detail.loading} error={detail.error} onRetry={detail.reload} />
                {current && (
                  <article className="mb-8 border-b border-base-300 pb-6">
                    <h2 className="font-semibold">{current.version}</h2>
                    <p className="text-sm">
                      {current.branch_name} · {t('Revisión {0}', { '0': current.revision })}
                    </p>
                    <p className="mt-2 text-sm">
                      {t(current.status === 'published' ? 'Publicada en producción' : 'Preparada')}
                    </p>
                    <ul className="mt-3 space-y-1">
                      {current.tasks?.map((task) => (
                        <li key={task.task_id}>
                          <Link className="text-sm underline" to={`/tasks/${task.task_id}`}>
                            {tasks.data?.items.find((item) => item.id === task.task_id)?.title ?? task.task_id}
                          </Link>{' '}
                          · {t('Revisión {0}', { '0': task.task_revision })}
                          {task.included_by_parent_id && (
                            <span className="ml-2 text-xs text-base-content/50">
                              {t('Integrada con la tarea principal')}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                    <ul className="mt-3 space-y-1 text-xs">
                      {current.repositories?.map((repo) => (
                        <li key={repo.repository_id}>
                          {repositories.data?.items.find((item) => item.id === repo.repository_id)?.remote_full_name ?? repo.repository_id}
                          {' · '}
                          <code className="break-all">{repo.head_sha ?? t('Pendiente de composición')}</code>
                        </li>
                      ))}
                    </ul>
                    <ReleaseComposition
                      release={current}
                      canManage={!!canPrepare}
                      onChanged={() => {
                        detail.reload()
                        releases.reload()
                      }}
                    />
                  </article>
                )}
              </>
            )}
            {canChange && (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  save()
                }}
                className="grid min-w-0 gap-x-8 gap-y-6 xl:grid-cols-2"
              >
                {!releaseId && (
                  <div className="grid min-w-0 gap-4 border-b border-base-300 pb-6 sm:grid-cols-2 xl:col-span-2">
                    <label className="grid min-w-0 gap-1 text-sm">
                      {t('Versión')}
                      <input
                        className="input w-full"
                        required
                        maxLength={128}
                        value={version}
                        onChange={(event) => setVersion(event.target.value)}
                        disabled={mutation.busy}
                      />
                    </label>
                    <label className="grid min-w-0 gap-1 text-sm">
                      {t('Rama de publicación')}
                      <input
                        className="input w-full"
                        required
                        pattern="release/.+"
                        maxLength={200}
                        value={branch}
                        onChange={(event) => setBranch(event.target.value)}
                        disabled={mutation.busy}
                      />
                    </label>
                  </div>
                )}
                <fieldset
                  disabled={mutation.busy}
                  className="min-w-0 border-b border-base-300 pb-6"
                >
                  <legend className="mb-3 text-sm font-semibold">
                    {t('Tareas seleccionadas')}
                  </legend>
                  <p className="mb-3 text-xs text-base-content/55">
                    {t('Selecciona tareas con su etapa terminada. Las subtareas de descomposición se entregan con su tarea principal.')}
                  </p>
                  <label className="mb-3 grid gap-1 text-sm">
                    {t('Buscar tareas')}
                    <input
                      className="input w-full"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  </label>
                  <DataMessage loading={tasks.loading} error={tasks.error} onRetry={tasks.reload} />
                  <div className="max-h-80 space-y-2 overflow-y-auto pr-2">
                    {available.map((task) => (
                      <label key={task.id} className="flex items-start gap-3 py-1 text-sm">
                        <input
                          type="checkbox"
                          className="checkbox checkbox-sm mt-0.5 shrink-0"
                          checked={selected.some((item) => item.id === task.id)}
                          onChange={() => choose(task.id)}
                        />
                        <span className="min-w-0 break-words">
                          {task.title} · {task.state_name ?? '—'}
                        </span>
                      </label>
                    ))}
                  </div>
                  {tasks.data?.next_after && (
                    <p className="mt-3 text-xs text-base-content/55">
                      {t('Hay más tareas disponibles. Usa el buscador de tareas para localizar su revisión.')}
                    </p>
                  )}
                </fieldset>
                <fieldset
                  disabled={mutation.busy}
                  className="min-w-0 border-b border-base-300 pb-6"
                >
                  <legend className="mb-3 text-sm font-semibold">
                    {t('Repositorios de la publicación')}
                  </legend>
                  <DataMessage
                    loading={repositories.loading}
                    error={repositories.error}
                    onRetry={repositories.reload}
                  />
                  <p className="mb-3 text-xs text-base-content/55">
                    {t('Selecciona los repositorios. El servidor creará la rama usando solo los commits vinculados.')}
                  </p>
                  <div className="max-h-80 divide-y divide-base-300/60 overflow-y-auto pr-2">
                    {repositories.data?.items
                      .filter(
                        (repo) =>
                          repo.authorization_status === 'authorized' &&
                          !repo.archived &&
                          repo.source_kind !== 'local_snapshot',
                      )
                      .map((repo) => (
                        <label
                          className="flex items-center gap-3 py-3 text-sm"
                          key={repo.id}
                        >
                          <input
                            type="checkbox"
                            className="checkbox checkbox-sm shrink-0"
                            checked={!!heads[repo.id]}
                            onChange={(event) =>
                              setHeads((values) => ({
                                ...values,
                                [repo.id]: event.target.checked ? 'selected' : '',
                              }))
                            }
                          />
                          <span className="min-w-0 break-all">
                            {repo.remote_full_name ?? repo.requested_full_name}
                          </span>
                        </label>
                      ))}
                  </div>
                </fieldset>
                <button
                  type="submit"
                  className="btn btn-primary justify-self-start xl:col-span-2"
                  disabled={
                    mutation.busy ||
                    !selected.length ||
                    !Object.values(heads).some((head) => head.trim())
                  }
                >
                  {t(releaseId ? 'Agregar tareas a la publicación' : 'Preparar publicación')}
                </button>
                {mutation.error && (
                  <p role="alert" className="text-sm text-error xl:col-span-2">
                    {t(mutation.error)}
                  </p>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
