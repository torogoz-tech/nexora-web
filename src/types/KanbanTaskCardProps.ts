import type { DeveloperBoardTask } from './DeveloperBoardTask'
import type { VisibleTask } from './VisibleTask'
export type KanbanTaskCardProps = {
  task: DeveloperBoardTask &
    Partial<
      Pick<
        VisibleTask,
        'type_code' | 'type_name' | 'type_icon' | 'assignee_name'
      >
    >
  onDetails?: (task: DeveloperBoardTask) => void
  onReassign: (task: DeveloperBoardTask) => void
}
