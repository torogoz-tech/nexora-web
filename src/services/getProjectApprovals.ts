import { getProjects } from './getProjects'
import { readApiJson } from './readApiJson'
import type { PendingApproval } from '../types/PendingApproval'
import type { EffectivePermissions } from '../types/EffectivePermissions'
export async function getProjectApprovals(signal: AbortSignal, permissions: EffectivePermissions): Promise<PendingApproval[]> {
  if (!permissions.grants.some(grant => grant.capability === 'approvals:grant')) return []
  const result: PendingApproval[] = []
  let cursor: string | undefined
  do {
    const projects = await getProjects(signal, false, cursor)
    for (const project of projects.items) {
      if (!permissions.grants.some(grant => grant.capability === 'approvals:grant' && (grant.project_id === null || grant.project_id === project.id))) continue
      let after: string | undefined
      do {
        const query = new URLSearchParams({ status: 'pending', limit: '100' })
        if (after) query.set('after', after)
        const value = await readApiJson(`/api/v1/projects/${encodeURIComponent(project.id)}/approval-requests?${query}`, signal)
        if (!value || typeof value !== 'object' || !('items' in value) || !Array.isArray(value.items) || !('next_after' in value) || value.next_after !== null && typeof value.next_after !== 'string') throw Error('Respuesta de aprobaciones no válida.')
        for (const item of value.items) {
          if (!item || typeof item !== 'object' || typeof item.id !== 'string' || typeof item.resource_id !== 'string' || typeof item.requested_by !== 'string' || typeof item.created_at !== 'string' || !Number.isSafeInteger(item.revision) || !['task', 'document_version'].includes(item.target_kind) || item.status !== 'pending') throw Error('Respuesta de aprobaciones no válida.')
          result.push({ id: item.id, kind: item.target_kind, title: project.name, member: '', date: item.created_at, reason: '', project: project.id, resourceId: item.resource_id, revision: item.revision, canDecide: item.requested_by !== permissions.actor_id, path: `/api/v1/projects/${encodeURIComponent(project.id)}/approval-requests/${encodeURIComponent(item.id)}` })
        }
        if (value.next_after === after) throw Error('Respuesta de aprobaciones no válida.')
        after = value.next_after ?? undefined
      } while (after)
    }
    if (projects.next_cursor === cursor) throw Error('Respuesta de aprobaciones no válida.')
    cursor = projects.next_cursor ?? undefined
  } while (cursor)
  return result
}
