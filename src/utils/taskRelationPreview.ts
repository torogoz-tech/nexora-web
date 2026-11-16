import type { TaskRelationSummary } from '../types/TaskRelationSummary'
import type { DeveloperBoardTask } from '../types/DeveloperBoardTask'
export function taskRelationPreview(task: TaskRelationSummary): DeveloperBoardTask {
  return { id: task.id, project_id: task.project_id, project_name: null, title: task.title, lifecycle: task.lifecycle, assignee_id: task.assignee_id, workflow_version_id: null, state_id: null, priority: 'medium', revision: task.revision, blocked: false }
}
