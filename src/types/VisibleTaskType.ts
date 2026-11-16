import type { TaskTypeIcon } from './TaskTypeIcon'
export type VisibleTaskType = {
  icon?: TaskTypeIcon

  code: string
  name: string
  color: string | null
  total: number
}
