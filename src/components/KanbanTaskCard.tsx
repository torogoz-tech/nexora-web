import { WorkNavigationContext } from '../app/WorkNavigationContext'
import { useContext } from 'react'
import { useAuth } from '../hooks/useAuth'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { taskPoolActions } from '../utils/taskPoolActions'
import { useTranslation } from '../hooks/useTranslation'
import { createElement } from 'react'
import {
  Eye,
  Flag,
  FolderKanban,
  LockKeyhole,
  ListTree,
  UserRound,
  UserRoundCog,
} from 'lucide-react'
import { getTaskTypeIcon } from '../utils/getTaskTypeIcon'
import RowAction from './RowAction'
import type { KanbanTaskCardProps } from '../types/KanbanTaskCardProps'
export default function KanbanTaskCard({
  task,
  onReassign,
  onDetails,
}: KanbanTaskCardProps) {
  const { t } = useTranslation()
  const navigation=useContext(WorkNavigationContext)
  const { session } = useAuth(), permissions = useContext(WorkspacePermissionsContext)
  const actions = taskPoolActions(task, session?.actorId, permissions?.role ?? null, permissions?.grants ?? [])
  return (
    <article className="rounded-xl border border-base-300 bg-base-100 p-4 shadow-sm transition-colors hover:border-base-content/25 motion-reduce:transition-none">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        {task.type_name && (
          <span className="inline-flex items-center gap-1.5 text-[11px] text-base-content/45">
            {createElement(
              getTaskTypeIcon(task.type_code ?? 'task', task.type_icon),
              {
                size: 13,
                style: {color:navigation?.types.items.find(type=>type.code===task.type_code)?.color ?? undefined},
                'aria-hidden': true,
              },
            )}
            {task.type_name}
          </span>
        )}
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-md bg-base-200 px-2 py-1 text-[11px] text-base-content/65">
          <Flag size={11} aria-hidden="true" />
          {
            {
              low: t('Baja'),
              medium: t('Media'),
              high: t('Alta'),
              critical: t('Crítica'),
            }[task.priority]
          }
        </span>
      </div>
      <h3 className="break-words text-sm font-semibold leading-relaxed">
        {task.title}
      </h3>
      <div className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-base-content/45">
        <FolderKanban
          size={14}
          className="mt-0.5 shrink-0"
          aria-hidden="true"
        />
        <span className="break-words">{task.project_name ?? t('Sin proyecto')}</span>
      </div>
      {task.assignee_name && (
        <div className="mt-2 flex items-start gap-2 text-xs leading-relaxed text-base-content/60">
          <UserRound size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span className="break-words">{task.assignee_name}</span>
        </div>
      )}
      {!!task.subtasks_total && <p className="mt-3 inline-flex items-center gap-1.5 text-xs tabular-nums text-base-content/50"><ListTree size={13}/>{t('Subtareas')}: {task.subtasks_completed ?? 0}/{task.subtasks_total}</p>}
      <footer className="mt-4 flex min-h-8 items-center justify-between gap-2 border-t border-base-300/60 pt-2">
        <span className="text-[11px] text-base-content/45">
          {task.blocked || (task.blocking_count ?? 0) > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <LockKeyhole size={12} aria-hidden="true" /> {t('Bloqueada')}{' '}
            </span>
          ) : !task.assignee_id ? (
            t('Sin responsable')
          ) : (
            ''
          )}
        </span>
        <div className="flex gap-1">
        {onDetails && <RowAction label={t('Ver tarea {0}', { '0': task.title })} onClick={() => onDetails(task)}><Eye size={15}/></RowAction>}
        {actions.assign && <RowAction
          label={t('Reasignar {0}', { '0': task.title })}
          onClick={() => onReassign(task)}
        >
          <UserRoundCog size={15} aria-hidden="true" />
        </RowAction>}
        </div>
      </footer>
    </article>
  )
}
