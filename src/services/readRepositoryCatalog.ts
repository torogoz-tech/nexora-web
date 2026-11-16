import {readApiJson} from './readApiJson'
import {parseRemoteRepositoryPage} from '../utils/parseRemoteRepositoryPage'
import type {RemoteRepository} from '../types/RemoteRepository'
export async function readRepositoryCatalog(connectionId:string,signal:AbortSignal){
 const items=new Map<string,RemoteRepository>(),seen=new Set<number>()
 let page:number|null=1
 while(page!==null){
  if(seen.has(page))throw Error('La página de repositorios no es válida.')
  seen.add(page)
  const result=parseRemoteRepositoryPage(await readApiJson(`/api/v1/git/connections/${encodeURIComponent(connectionId)}/repositories?page=${page}&limit=100`,signal))
  for(const item of result.items)items.set(`${item.provider}:${item.remote_id}`,item)
  page=result.next_page
 }
 signal.throwIfAborted()
 return [...items.values()]
}
