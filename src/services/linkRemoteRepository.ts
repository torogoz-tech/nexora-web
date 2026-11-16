import { readApiJson } from './readApiJson'
import { integrationRequest } from './integrationRequest'
import { parseRepositoryPage } from '../utils/parseRepositoryPage'
import { parseRepository } from '../utils/parseRepository'
import type { RemoteRepository } from '../types/RemoteRepository'
import type { Repository } from '../types/Repository'
export async function linkRemoteRepository(project: string, connection: string, selected: RemoteRepository, signal: AbortSignal, key: string): Promise<Repository> {
  const path = `/api/v1/projects/${encodeURIComponent(project)}/repositories`
  // Recover an existing pending inscription when authorization previously failed.
  let cursor: string | null = null
  let existing: Repository | undefined
  const visited = new Set<string>()
  do {
    const page = parseRepositoryPage(await readApiJson(`${path}?limit=100${cursor ? `&after=${encodeURIComponent(cursor)}` : ''}`, signal))
    existing = page.items.find(item => item.provider === selected.provider && !item.archived && (item.remote_id === selected.remote_id || (item.authorization_status === 'awaiting_authorization' && item.requested_full_name === selected.full_name)))
    cursor = page.next_cursor
    if (cursor && visited.has(cursor)) throw Error('La página de repositorios no es válida.')
    if (cursor) visited.add(cursor)
  } while (!existing && cursor)
  const repository = existing ?? parseRepository(await integrationRequest(path, 'POST', {provider:selected.provider,full_name:selected.full_name}, `${key}-register`, signal))
  if (repository.authorization_status === 'authorized' && repository.remote_id === selected.remote_id) return repository
  return parseRepository(await integrationRequest(`${path}/${encodeURIComponent(repository.id)}/authorize`, 'POST', {connection_id:connection,expected_revision:repository.revision,expected_remote_id:selected.remote_id}, `${key}-authorize`, signal))
}
