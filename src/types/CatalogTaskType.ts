import type { TaskTypeIcon } from './TaskTypeIcon'
export type CatalogTaskType = {
  purpose?: import('./TaskPurpose').TaskPurpose
  icon?: TaskTypeIcon

  code: string
  name: string
  description: string | null
  color: string | null
  archived: boolean
  revision: number
}
