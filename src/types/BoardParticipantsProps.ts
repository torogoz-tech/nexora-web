import type { TaskParticipant } from './TaskParticipant'
export type BoardParticipantsProps = {
  people: TaskParticipant[]
  scope: 'board' | 'page'
}
