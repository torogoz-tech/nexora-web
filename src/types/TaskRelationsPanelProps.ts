import type { TaskDetails } from './TaskDetails'
import type { TaskRelations } from './TaskRelations'
import type { TaskRelationSummary } from './TaskRelationSummary'
export type TaskRelationsPanelProps = {
  task: TaskDetails
  relations: TaskRelations | null
  loading: boolean
  error: string | null
  busy: boolean
  onRetry: () => void
  onChanged: () => void
  onOpen: (task: TaskRelationSummary) => void
}
