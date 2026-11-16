import type { DeveloperBoardTask } from '../types/DeveloperBoardTask'
export function activeBoardTasks<T extends DeveloperBoardTask>(tasks: T[]): T[] {
  return tasks.filter(task => (task.lifecycle ?? 'active') === 'active' && !!task.workflow_version_id && !!task.state_id)
}
