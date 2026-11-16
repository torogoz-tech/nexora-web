import type { TaskParticipant } from './TaskParticipant'
import type { VisibleTask } from './VisibleTask'
export type VisibleTaskPage = {
  items: VisibleTask[]
  next_after: string | null
  total: number
  participants?: TaskParticipant[]
}
