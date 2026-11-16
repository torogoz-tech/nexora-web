import {apiFetch} from './apiFetch'
export async function archiveGitAuthor(id:string,archived:boolean,key:string,signal:AbortSignal){
 const response=await apiFetch(`/api/v1/git-authors/${encodeURIComponent(id)}/${archived?'archive':'restore'}`,{method:'POST',headers:{'Idempotency-Key':key},signal})
 if(!response.ok)throw Error('No pudimos actualizar el autor Git.')
}
