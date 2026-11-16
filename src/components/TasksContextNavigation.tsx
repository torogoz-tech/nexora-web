import { useTranslation } from '../hooks/useTranslation'
import { Link, useSearchParams } from 'react-router'
import { ListTodo } from 'lucide-react'
import { useWorkNavigation } from '../hooks/useWorkNavigation'
import { getTaskTypeIcon } from '../utils/getTaskTypeIcon'
import DataMessage from './DataMessage'
import type { TasksContextNavigationProps } from '../types/TasksContextNavigationProps'
export default function TasksContextNavigation({
  onClose,
  hideAllLink = false,
}: TasksContextNavigationProps) {
  const { t } = useTranslation()
  const { types } = useWorkNavigation(),
    [params] = useSearchParams(),
    selected = params.get('type')
  return (
    <nav aria-label={t('Tipos de tareas')} className="flex flex-col gap-1">
      {!hideAllLink && <Link
        to="/tasks"
        onClick={onClose}
        className="context-nav-item"
        aria-current={!selected ? 'page' : undefined}
      >
        <ListTodo size={16} className="shrink-0" />
        <span className="min-w-0 flex-1 truncate">{t('Todas las tareas')}</span>
        {types.total !== null && (
          <span className="rounded-md bg-base-100/60 px-2 py-0.5 text-xs tabular-nums text-base-content/60">
            {types.total}
          </span>
        )}
      </Link>}
      {types.loading || types.error ? (
        <DataMessage
          loading={types.loading}
          error={t(types.error)}
          onRetry={types.reload}
        />
      ) : (
        types.items.map((type) => {
          const Icon = getTaskTypeIcon(type.code, type.icon)
          return (
            <Link
              key={type.code}
              to={`/tasks?${new URLSearchParams({ type: type.code })}`}
              onClick={onClose}
              className="context-nav-item"
              aria-current={selected === type.code ? 'page' : undefined}
            >
              <Icon
                size={16}
                className="shrink-0"
                style={{ color: type.color ?? undefined }}
              />
              <span className="min-w-0 flex-1 truncate">{type.name}</span>
              <span
                aria-label={`${type.total} ${type.total === 1 ? t('tarea') : t('tareas')}`}
                className="rounded-md bg-base-100/60 px-2 py-0.5 text-xs tabular-nums text-base-content/60"
              >
                {type.total}
              </span>
            </Link>
          )
        })
      )}
    </nav>
  )
}
