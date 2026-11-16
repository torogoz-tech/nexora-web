import type { VisibleTask } from '../types/VisibleTask'
import type { TaskParticipant } from '../types/TaskParticipant'
export function getTaskParticipants(tasks: VisibleTask[]): TaskParticipant[] {
  const people = new Map<string, TaskParticipant>()
  for (const task of tasks) {
    if (!task.assignee_id) continue
    const person = people.get(task.assignee_id)
    if (person) person.total++
    else
      people.set(task.assignee_id, {
        actor_id: task.assignee_id,
        name: task.assignee_name ?? task.assignee_id,
        total: 1,
      })
  }
  return [...people.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'))
}
