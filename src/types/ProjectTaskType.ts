import type { TaskTypeIcon } from './TaskTypeIcon'
export type ProjectTaskType = {
  icon?: TaskTypeIcon

  code: string
  project_id: string
  name: string
  archived: boolean
}
