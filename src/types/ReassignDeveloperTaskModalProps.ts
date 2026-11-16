import type { DeveloperBoardTask } from './DeveloperBoardTask'
export type ReassignDeveloperTaskModalProps = {
  task: DeveloperBoardTask
  workflowId: string
  onClose: () => void
  onChanged: () => void
}
