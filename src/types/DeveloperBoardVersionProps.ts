import type { DeveloperBoardTask } from './DeveloperBoardTask'
export type DeveloperBoardVersionProps = {
  workflowId: string
  versionId: string
  tasks: DeveloperBoardTask[]
  onReassign: (task: DeveloperBoardTask) => void
}
