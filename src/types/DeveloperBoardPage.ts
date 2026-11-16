import type { DeveloperBoardTask } from './DeveloperBoardTask'
export type DeveloperBoardPage = {
  items: DeveloperBoardTask[]
  next_after: string | null
}
