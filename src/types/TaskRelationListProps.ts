import type { TaskRelationSummary } from './TaskRelationSummary'
export type TaskRelationListProps = {
  items: TaskRelationSummary[]
  onOpen: (task: TaskRelationSummary) => void
  onRemove?: (task: TaskRelationSummary) => void
  busy?: boolean
}
