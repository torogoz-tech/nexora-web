import { useTranslation } from '../hooks/useTranslation'
import { ArrowRight, ListChecks } from 'lucide-react'
import Tooltip from './Tooltip'
import type { WorkflowCanvasTransitionProps } from '../types/WorkflowCanvasTransitionProps'

export default function WorkflowCanvasTransition({
  transition,
  position,
  selected,
  onSelect,
  onEdit,
}: WorkflowCanvasTransitionProps) {
  const { t } = useTranslation()
  const configured = transition.guards.length > 0 || (transition.steps?.length ?? 0) > 0
  const Icon = configured ? ListChecks : ArrowRight
  const className = `flex size-8 items-center justify-center rounded-full border bg-base-100 shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${selected ? 'border-primary text-primary ring-2 ring-primary/20' : 'border-base-content/30 text-base-content/70'} ${onSelect ? 'cursor-pointer hover:border-primary hover:text-primary' : ''}`
  return (
    <div
      data-workflow-transition={transition.id}
      className="absolute z-[15] -translate-x-1/2 -translate-y-1/2"
      style={{ left: position.x, top: position.y }}
    >
      <Tooltip label={onEdit ? t(transition.automatic ? 'Acciones finales. Doble clic o Enter para abrir las propiedades.' : 'Doble clic o Enter para abrir las propiedades.') : t(transition.automatic ? 'Acciones finales' : 'Transición')}>
        {onSelect ? (
          <button
            type="button"
            className={className}
            aria-label={t('Configurar transición')}
            aria-pressed={selected}
            aria-haspopup={onEdit ? 'dialog' : undefined}
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              onSelect(transition.id)
              if (event.detail === 0) onEdit?.(transition.id)
            }}
            onDoubleClick={() => onEdit?.(transition.id)}
            onFocus={() => onSelect(transition.id)}
          >
            <Icon size={14} aria-hidden="true" />
          </button>
        ) : (
          <span className={className} role="img" aria-label={t('Transición')}>
            <Icon size={14} aria-hidden="true" />
          </span>
        )}
      </Tooltip>
    </div>
  )
}
