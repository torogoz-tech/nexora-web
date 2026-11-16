import type { LiveUpdate } from '../types/LiveUpdate'
export function matchesLiveUpdate(path: string | null, update: LiveUpdate) {
  if (!path) return false
  if (path === '/api/v1/approval-inbox' && update.topics.some(topic => ['approvals', 'tasks', 'permissions'].includes(topic))) return true
  if ((path === '/api/v1/labor-calendar' || path === '/api/v1/overtime') && update.topics.includes('calendar')) return true
  if (path.startsWith('/api/v1/notifications') && update.topics.some((topic) => ['notifications', 'tasks', 'approvals', 'calendar'].includes(topic))) return true
  if(update.topics.includes('documents')&&path.startsWith('/api/v1/knowledge/'))return true
  if(update.topics.includes('navigation')) return path.split('?')[0]==='/api/v1/settings/navigation'
  if (update.topics.includes('tasks') && /^\/api\/v1\/(tasks(?:\/|\?|$)|me\/(?:tasks|workflow-tasks|task-types)(?:\?|$))/.test(path)) return true
  if (/^\/api\/v1\/members\/[^/]+\/(profile|work-week)(?:\?|$)/.test(path) && update.topics.some(topic=>['tasks','calendar'].includes(topic))) return true
  if (update.topics.includes('permissions')) return path.split('?')[0] === '/api/v1/me/permissions'
  return update.projectId === null
    ? update.topics.includes('preferences')
      ? path.split('?')[0] === '/api/v1/settings/general'
      : path.split('?')[0] === '/api/v1/task-types'
    : path.startsWith(
        `/api/v1/projects/${encodeURIComponent(update.projectId)}/`,
      )
}
