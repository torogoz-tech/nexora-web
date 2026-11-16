import { useTranslation } from '../hooks/useTranslation'
import type { VisibleTask } from '../types/VisibleTask'
export default function TaskStatusBadges({ task }: { task: VisibleTask }) {
  const { t } = useTranslation()
  const labels = {
    pending: 'Pendiente',
    active: 'En progreso',
    paused: 'En pausa',
    completed: 'Finalizado',
  }
  const color =
    task.state_color && /^#[0-9a-fA-F]{6}$/.test(task.state_color)
      ? task.state_color
      : undefined
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <span className="inline-flex whitespace-nowrap rounded-lg bg-base-200 px-2 py-1 text-xs">
        {t(labels[task.lifecycle])}
      </span>
      {task.workflow_version_id && task.state_name && (
        <span
          className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium"
          style={{
            color: color ?? 'var(--color-base-content)',
            backgroundColor: color ? `${color}1a` : 'var(--color-base-200)',
          }}
        >
          <span
            aria-hidden="true"
            className="size-1.5 shrink-0 rounded-full bg-current"
          />
          {task.state_name}
        </span>
      )}
    </div>
  )
}
