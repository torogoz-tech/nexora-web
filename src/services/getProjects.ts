import { apiFetch } from './apiFetch'
import { parseProject } from '../utils/parseProject'
import type { ProjectPage } from '../types/ProjectPage'
export async function getProjects(
  signal: AbortSignal,
  includeArchived = true,
  after?: string,
): Promise<ProjectPage> {
  const query = new URLSearchParams()
  if (includeArchived) query.set('include_archived', 'true')
  if (after) query.set('after', after)
  const response = await apiFetch(
    `/api/v1/projects${query.size ? `?${query}` : ''}`,
    { signal },
  )
  if (response.status === 401) throw new Error('authentication-required')
  if (response.status === 403) throw new Error('access-denied')
  if (!response.ok) throw new Error('request-failed')
  const data: unknown = await response.json()
  if (
    typeof data !== 'object' ||
    data === null ||
    !('items' in data) ||
    !Array.isArray(data.items) ||
    !('next_cursor' in data) ||
    (data.next_cursor !== null && typeof data.next_cursor !== 'string')
  )
    throw new Error('invalid-response')
  return { items: data.items.map(parseProject), next_cursor: data.next_cursor }
}
