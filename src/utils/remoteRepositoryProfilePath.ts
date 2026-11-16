import type { RemoteRepository } from '../types/RemoteRepository'
export function remoteRepositoryProfilePath(connectionId:string,repository:RemoteRepository) {
 return `/code/accounts/${encodeURIComponent(connectionId)}/repositories/${encodeURIComponent(repository.remote_id)}?${new URLSearchParams({full_name:repository.full_name})}`
}
