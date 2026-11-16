import type { MemberRole } from '../types/MemberRole'
import type { DeveloperBoardTask } from '../types/DeveloperBoardTask'
import type { EffectivePermissions } from '../types/EffectivePermissions'
export function taskPoolActions(task: DeveloperBoardTask & { created_by?: string }, actorId: string | undefined, role: MemberRole | null, grants: EffectivePermissions['grants'] = []) {
  const pending = task.lifecycle === 'pending'
  const scoped = (capability: string) => grants.some(grant => grant.capability === capability && (grant.project_id === null || grant.project_id === task.project_id))
  const coordinator = role === 'technical_lead' || role === 'pmo' || role === 'manager' || role === 'super_admin'
  const manager = role === 'manager' || role === 'super_admin'
  const executionRole = role === 'developer' || coordinator
  const human = !!role && !!actorId
  return {
    reserve: pending && human && !task.assignee_id && (task.project_id === null || scoped('tasks:write')),
    take: (pending || task.lifecycle==='active'&&!task.assignee_id) && human && executionRole && (!task.assignee_id || task.assignee_id === actorId) && (task.project_id === null || scoped('tasks:transition')),
    assign: human && (task.project_id === null ? task.assignee_id === actorId || task.created_by === actorId || coordinator : scoped('tasks:write')),
    pause: task.lifecycle === 'active' && human && (task.assignee_id === actorId || manager) && executionRole && (task.project_id === null || scoped('tasks:transition')),
    resume: task.lifecycle === 'paused' && human && task.assignee_id === actorId && executionRole && (task.project_id === null || scoped('tasks:transition')),
    completeGeneral: task.purpose === 'general' && !task.entry_workflow_id && !task.workflow_version_id && task.lifecycle === 'active' && human && task.assignee_id === actorId && (task.project_id === null || scoped('tasks:transition')),
    archive: (manager || pending || task.lifecycle === 'completed') && coordinator && (task.project_id === null || scoped('tasks:write')),
    transition: task.lifecycle === 'active' && !!task.assignee_id && human && (task.project_id === null ? task.assignee_id === actorId && executionRole : scoped('tasks:transition')),
  }
}
