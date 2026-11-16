import type { TaskCreator } from './TaskCreator'
import type { TaskTypeIcon } from './TaskTypeIcon'
import type { DeveloperBoardTask } from './DeveloperBoardTask'
export type VisibleTask = DeveloperBoardTask & {
  creator?: TaskCreator | null
  assignee?: TaskCreator | null
  type_icon?: TaskTypeIcon

  type_code: string
  type_name: string
  state_color?: string | null
  state_name: string | null
  workflow_id: string | null
  created_by_name?: string | null
  created_by: string
  state_changed_at?: string | null
  updated_at: string
  assignee_name: string | null
  archived: boolean
}
