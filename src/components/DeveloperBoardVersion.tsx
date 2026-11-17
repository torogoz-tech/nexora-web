import { useLocation, useNavigate } from 'react-router'
import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { taskDetailPath } from '../utils/taskDetailPath'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { parseWorkflowVersion } from '../utils/parseWorkflowVersion'
import DataMessage from './DataMessage'
import KanbanTaskCard from './KanbanTaskCard'
import type { DeveloperBoardVersionProps } from '../types/DeveloperBoardVersionProps'
export default function DeveloperBoardVersion({
  workflowId,
  versionId,
  tasks,
  onReassign,
}: DeveloperBoardVersionProps) {
  const { t } = useTranslation()
  const navigate = useNavigate(), location = useLocation()
  const columns = useRef<HTMLDivElement>(null)
  const version = useApiData(
    `/api/v1/workflows/${encodeURIComponent(workflowId)}/versions/${encodeURIComponent(versionId)}`,
    parseWorkflowVersion,
  )
  if (version.loading || version.error)
    return (
      <DataMessage
        loading={version.loading}
        error={t(version.error)}
        onRetry={version.reload}
      />
    )
  return (
    version.data && (
      <section
        className="kanban-version"
        aria-label={t('Tablero de versión {0}', { '0': version.data.number })}
      >
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="mb-2 flex justify-end gap-1 px-4 sm:px-5"><button type="button" className="btn btn-sm btn-square btn-ghost" aria-label={t('Desplazar tablero a la izquierda')} onClick={() => columns.current?.scrollBy({ left: -360, behavior: 'smooth' })}><ChevronLeft size={16}/></button><button type="button" className="btn btn-sm btn-square btn-ghost" aria-label={t('Desplazar tablero a la derecha')} onClick={() => columns.current?.scrollBy({ left: 360, behavior: 'smooth' })}><ChevronRight size={16}/></button></div>
        <div
          ref={columns}
          className="kanban-columns"
          tabIndex={0}
          role="region"
          aria-label={t('Columnas de versión {0}', {
            '0': version.data.number,
          })}
        >
          {!version.data.graph.states.some(state => !state.terminal) && <p className="p-5 text-sm text-base-content/50">{t('Este workflow no tiene etapas activas. Las tareas completadas se conservan en Tareas.')}</p>}
          {version.data.graph.states.filter(state => !state.terminal).map((state) => {
            const stateTasks = tasks.filter(
              (task) => (task.lifecycle ?? 'active') === 'active' && task.state_id === state.id,
            )
            return (
              <section
                key={state.id}
                className="kanban-column"
                aria-label={state.name}
              >
                <header className="flex shrink-0 items-center gap-2.5 border-b border-base-300/60 px-4 py-4">
                  <h2 style={{color:state.color}} className="min-w-0 flex-1 break-words text-sm font-semibold">
                    {state.name}
                  </h2>
                  <span className="rounded-md bg-base-100/70 px-2 py-0.5 text-xs tabular-nums text-base-content/45">
                    {stateTasks.length}
                  </span>
                </header>
                <div className="kanban-column-content">
                  <ul className="space-y-3">
                    {stateTasks.map((task) => (
                      <li key={task.id}>
                        <KanbanTaskCard task={task} onReassign={onReassign} onDetails={task => navigate(taskDetailPath(task.id, location.pathname + location.search))} />
                      </li>
                    ))}
                  </ul>
                  {stateTasks.length === 0 && (
                    <p className="py-10 text-center text-xs text-base-content/30">
                      {' '}
                      {t('Sin tareas')}{' '}
                    </p>
                  )}
                </div>
              </section>
            )
          })}
        </div></div>
      </section>
    )
  )
}
