import { useTranslation } from '../hooks/useTranslation'
import type { DeveloperBoardTask } from '../types/DeveloperBoardTask'
export default function TaskPriorityBadge({
  priority,
}: {
  priority: DeveloperBoardTask['priority']
}) {
  const { t } = useTranslation()
  const styles = {
    low: 'bg-info/10 text-info',
    medium: 'bg-warning/10 text-warning',
    high: 'bg-orange-500/15 text-orange-600 dark:text-orange-300',
    critical: 'bg-error/15 text-error',
  }
  const labels = {
    low: 'Baja',
    medium: 'Media',
    high: 'Alta',
    critical: 'Crítica',
  }
  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-medium ${styles[priority]}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {t(labels[priority])}
    </span>
  )
}
