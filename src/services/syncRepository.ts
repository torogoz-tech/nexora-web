import { readApiJson } from './readApiJson'
import { integrationRequest } from './integrationRequest'
import { parseRepository } from '../utils/parseRepository'
import { requireRecord } from '../utils/requireRecord'
export async function syncRepository(project: string, repository: string, signal: AbortSignal, key: string) {
  const base = `/api/v1/projects/${encodeURIComponent(project)}/repositories/${encodeURIComponent(repository)}`
  const current = parseRepository(await readApiJson(base, signal))
  if (current.archived || current.authorization_status !== 'authorized' || current.source_kind === 'local_snapshot') throw Error('Vincula y autoriza el repositorio antes de sincronizarlo.')
  const job = requireRecord(await integrationRequest(`${base}/sync`, 'POST', { expected_revision: current.revision }, key, signal))
  if (typeof job.id !== 'string' || typeof job.state !== 'string') throw Error('La respuesta de sincronización no es válida.')
  return { id: job.id, state: job.state, project }
}
