import Pagination from '../components/Pagination'
import { useUrlCursorPagination } from '../hooks/useUrlCursorPagination'
import { activeBoardTasks } from '../utils/activeBoardTasks'
import { useTranslation } from '../hooks/useTranslation'
import IconButton from '../components/IconButton'
import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useApiData } from '../hooks/useApiData'
import { parseOptionalDeveloperWorkflow } from '../utils/parseOptionalDeveloperWorkflow'
import { parseDeveloperBoardPage } from '../utils/parseDeveloperBoardPage'
import { parseWorkflowDefinition } from '../utils/parseWorkflowDefinition'
import DataMessage from '../components/DataMessage'
import DeveloperBoardVersion from '../components/DeveloperBoardVersion'
import ReassignDeveloperTaskModal from '../components/ReassignDeveloperTaskModal'
import type { DeveloperBoardTask } from '../types/DeveloperBoardTask'
export default function DeveloperBoardPage() {
  const { t } = useTranslation()
  const { session } = useAuth(),
    [selected, setSelected] = useState<DeveloperBoardTask | null>(null)
  const binding = useApiData(
    session
      ? `/api/v1/actors/${encodeURIComponent(session.actorId)}/workflow`
      : null,
    parseOptionalDeveloperWorkflow,
  )
  const workflow = useApiData(
    binding.data
      ? `/api/v1/workflows/${encodeURIComponent(binding.data.workflow_id)}`
      : null,
    parseWorkflowDefinition,
  )
  const paging=useUrlCursorPagination()
  const after = paging.after
  const tasks = useApiData(
    binding.data
      ? `/api/v1/me/workflow-tasks?lifecycle=active&limit=100${after ? `&after=${encodeURIComponent(after)}` : ''}`
      : null,
    parseDeveloperBoardPage,
  )
  const versions = [
    ...new Set(activeBoardTasks(tasks.data?.items ?? []).map((task) => task.workflow_version_id!) ?? []),
  ]
  if (!versions.length && binding.data)
    versions.push(binding.data.workflow_version_id)
  const reload = () => {
    binding.reload()
    workflow.reload()
    tasks.reload()
  }
  return (
    <section
      className="flex min-w-0 flex-1 flex-col"
      aria-label={t('Mi tablero')}
    >
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">
            {workflow.data?.name ?? t('Mi tablero')}
          </h1>
          <p className="mt-1 text-xs text-base-content/45">
            {' '}
            {t(
              'Tus tareas de todos los proyectos a los que tienes acceso.',
            )}{' '}
          </p>
        </div>
        <IconButton
          type="button"
          variant="ghost"
          disabled={tasks.loading || binding.loading}
          onClick={reload}
          label={t('Actualizar tablero')}
        >
          <RefreshCw size={16} />
        </IconButton>
      </header>
      {binding.loading ||
      workflow.loading ||
      tasks.loading ||
      binding.error ||
      workflow.error ||
      tasks.error ? (
        <DataMessage
          loading={binding.loading || workflow.loading || tasks.loading}
          error={binding.error ?? workflow.error ?? tasks.error}
          onRetry={reload}
        />
      ) : !binding.data ? (
        <DataMessage
          message={t(
            'Todavía no estás vinculado a un workflow. Contacta a tu administrador.',
          )}
        />
      ) : (
        versions.map((version) => (
          <DeveloperBoardVersion
            key={version}
            workflowId={binding.data!.workflow_id}
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
      <Pagination page={paging.page} hasPrevious={paging.hasPrevious} count={tasks.data?.items.length} busy={tasks.loading} hasNext={!!tasks.data?.next_after} onPrevious={paging.previous} onNext={()=>{if(tasks.data?.next_after)paging.next(tasks.data.next_after)}}/>
      {selected && binding.data && (
        <ReassignDeveloperTaskModal
          task={selected}
          workflowId={binding.data.workflow_id}
          onClose={() => setSelected(null)}
          onChanged={reload}
        />
      )}
    </section>
  )
}
