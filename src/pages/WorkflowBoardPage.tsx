import { taskReturnPath } from '../utils/taskReturnPath'
import {useBoardTasks} from '../hooks/useBoardTasks'
import { activeBoardTasks } from '../utils/activeBoardTasks'
import { useTranslation } from '../hooks/useTranslation'
import { useState } from 'react'
import { useSearchParams, useNavigate, useLocation } from 'react-router'
import {
  Plus,
  Search,
  RefreshCw,
} from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { parseWorkflowDefinition } from '../utils/parseWorkflowDefinition'
import BoardParticipants from '../components/BoardParticipants'
import WorkflowSymbol from '../components/WorkflowSymbol'
import { getTaskParticipants } from '../utils/getTaskParticipants'
import DataMessage from '../components/DataMessage'
import IconButton from '../components/IconButton'
import DeveloperBoardVersion from '../components/DeveloperBoardVersion'
import ReassignDeveloperTaskModal from '../components/ReassignDeveloperTaskModal'
import type { DeveloperBoardTask } from '../types/DeveloperBoardTask'
import type { WorkflowBoardPageProps } from '../types/WorkflowBoardPageProps'
export default function WorkflowBoardPage({ id }: WorkflowBoardPageProps) {
  const { t } = useTranslation()
  const [params, setParams] = useSearchParams(),
    [selected, setSelected] = useState<DeveloperBoardTask | null>(null)
  const navigate = useNavigate(), location = useLocation()
  const workflow = useApiData(
    `/api/v1/workflows/${encodeURIComponent(id)}`,
    parseWorkflowDefinition,
  )
  const search = params.get('q') ?? ''
  const tasks = useBoardTasks(
    `/api/v1/me/tasks?${new URLSearchParams({ workflow_id: id, lifecycle: 'active', limit: '100', ...(search ? { search } : {}) })}`,
  )
  const versions = [
    ...new Set(activeBoardTasks(tasks.data?.items ?? []).map((task) => task.workflow_version_id!) ?? []),
  ]
  if (!versions.length && workflow.data?.latest_version_id)
    versions.push(workflow.data.latest_version_id)
  const reload = () => {
    workflow.reload()
    tasks.reload()
  }
  return (
    <section
      aria-label={t('Tablero del workflow')}
      className="flex h-full min-h-0 min-w-0 flex-1 flex-col"
    >
      <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-base-300 px-4 py-4 sm:px-5">
        <div className="min-w-0 flex-1 basis-48">
          <h1 className="flex items-center gap-2 break-words text-xl font-semibold">
            <WorkflowSymbol color={workflow.data?.color} icon={workflow.data?.icon} className="shrink-0"/>
            {workflow.data?.name ?? t('Tablero')}
          </h1>
          {workflow.data?.purpose?.trim() && (
            <p className="mt-1 line-clamp-2 text-xs text-base-content/45">
              {workflow.data.purpose}
            </p>
          )}
        </div>
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <IconButton
            type="button"
            label={t('Crear tarea')}
            className="tooltip-bottom"
            variant="primary"
            disabled={
              workflow.loading
            }
            onClick={() => navigate(`/tasks/new?${new URLSearchParams({ returnTo:taskReturnPath(location.pathname + location.search) })}`)}
          >
            <Plus size={16} />
          </IconButton>
          <label className="input input-sm flex w-52 max-w-full items-center gap-2">
            <Search
              size={15}
              className="shrink-0 text-base-content/45"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label={t('Buscar tareas del tablero')}
              placeholder={t('Buscar tareas…')}
              className="min-w-0"
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
          <BoardParticipants
            people={
              tasks.data?.participants ??
              getTaskParticipants(tasks.data?.items ?? [])
            }
            scope={tasks.data?.participants ? 'board' : 'page'}
          />
          <IconButton
            type="button"
            label={t('Actualizar tablero')}
            className="tooltip-bottom"
            disabled={workflow.loading || tasks.loading}
            onClick={reload}
          >
            <RefreshCw size={16} />
          </IconButton>
        </div>
      </header>
      <div className="kanban-versions">
        {workflow.loading || tasks.loading || workflow.error || tasks.error ? (
          <DataMessage
            loading={workflow.loading || tasks.loading}
            error={workflow.error ?? tasks.error}
            onRetry={reload}
          />
        ) : !versions.length ? (
          <DataMessage
            message={t('Este workflow todavía no tiene una versión publicada.')}
          />
        ) : (
          versions.map((version) => (
            <DeveloperBoardVersion
              key={version}
              workflowId={id}
              versionId={version}
              tasks={
                activeBoardTasks(tasks.data?.items ?? []).filter(
                  (task) => task.workflow_version_id === version,
                ) ?? []
              }
              onReassign={setSelected}
            />
          ))
        )}
      </div>
      {selected && (
        <ReassignDeveloperTaskModal
          task={selected}
          workflowId={id}
          onClose={() => setSelected(null)}
          onChanged={reload}
        />
      )}
    </section>
  )
}
