import { useTranslation } from '../hooks/useTranslation'
import { Link, useLocation } from 'react-router'
import WorkflowSymbol from './WorkflowSymbol'
import { useWorkNavigation } from '../hooks/useWorkNavigation'
import DataMessage from './DataMessage'
import type { WorkContextNavigationProps } from '../types/WorkContextNavigationProps'
export default function BoardsContextNavigation({
  onClose,
}: WorkContextNavigationProps) {
  const { t } = useTranslation()
  const { workflows } = useWorkNavigation(),
    location = useLocation()
  if (workflows.loading || workflows.error)
    return (
      <DataMessage
        loading={workflows.loading}
        error={t(workflows.error)}
        onRetry={workflows.reload}
      />
    )
  return (
    <nav aria-label="Tableros por workflow" className="flex flex-col gap-1">
      {workflows.items.map((workflow) => {
        const path = `/boards/${encodeURIComponent(workflow.id)}`
        return (
          <Link
            key={workflow.id}
            to={path}
            onClick={onClose}
            className="context-nav-item"
            aria-current={location.pathname === path ? 'page' : undefined}
          >
            <WorkflowSymbol color={workflow.color} icon={workflow.icon} size={16} className="shrink-0" />
            <span className="min-w-0 truncate">{workflow.name}</span>
          </Link>
        )
      })}
      {workflows.items.length === 0 && (
        <p className="px-3 py-4 text-xs leading-relaxed text-base-content/45">
          {' '}
          {t('No tienes workflows disponibles para consultar.')}{' '}
        </p>
      )}
    </nav>
  )
}
