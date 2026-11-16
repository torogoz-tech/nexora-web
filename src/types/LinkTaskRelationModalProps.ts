import type { TaskDetails } from './TaskDetails'
import type { TaskRelations } from './TaskRelations'
export type LinkTaskRelationModalProps = {
  task: TaskDetails
  relations: TaskRelations
  kind: 'subtask' | 'prerequisite' | 'dependent'
  onClose: () => void
  onChanged: () => void
}
