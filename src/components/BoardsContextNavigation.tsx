import { useTranslation } from '../hooks/useTranslation'
import { Link, useLocation } from 'react-router'
import WorkflowSymbol from './WorkflowSymbol'
import { useWorkNavigation } from '../hooks/useWorkNavigation'
import DataMessage from './DataMessage'
import type { WorkContextNavigationProps } from '../types/WorkContextNavigationProps'
import { useOrderedWorkflows } from '../hooks/useOrderedWorkflows'
import { ArrowDown, ArrowUp } from 'lucide-react'
export default function BoardsContextNavigation({
  onClose,
}: WorkContextNavigationProps) {
  const { t } = useTranslation()
  const { workflows } = useWorkNavigation(),
    location = useLocation()
  const ordered = useOrderedWorkflows(workflows.items)
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
      {ordered.items.map((workflow, index) => {
        const path = `/boards/${encodeURIComponent(workflow.id)}`
        return (
          <div key={workflow.id} className="group flex items-center gap-1">
            <Link to={path} onClick={onClose} className="context-nav-item min-w-0 flex-1" aria-current={location.pathname === path ? 'page' : undefined}>
              <WorkflowSymbol color={workflow.color} icon={workflow.icon} size={16} className="shrink-0" />
              <span className="min-w-0 truncate">{workflow.name}</span>
            </Link>
            <span className="flex shrink-0 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <button type="button" className="btn btn-ghost btn-xs btn-square" aria-label={t('Mover tablero arriba')} disabled={index === 0} onClick={() => ordered.move(workflow.id, -1)}><ArrowUp size={13}/></button>
              <button type="button" className="btn btn-ghost btn-xs btn-square" aria-label={t('Mover tablero abajo')} disabled={index === ordered.items.length - 1} onClick={() => ordered.move(workflow.id, 1)}><ArrowDown size={13}/></button>
            </span>
          </div>
        )
      })}
      {ordered.items.length === 0 && (
        <p className="px-3 py-4 text-xs leading-relaxed text-base-content/45">
          {' '}
          {t('No tienes workflows disponibles para consultar.')}{' '}
        </p>
      )}
    </nav>
  )
}
