import {apiFetch} from './apiFetch'
export async function completeFeature(project: string, feature: string, revision: number, key: string, signal: AbortSignal) {
  const response=await apiFetch(`/api/v1/projects/${encodeURIComponent(project)}/features/${encodeURIComponent(feature)}/complete`,{
    method:'POST',signal,headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({expected_revision:revision}),
  })
  if(response.status===403) throw Error('Solo gerentes y superadministradores pueden completar funcionalidades.')
  if(response.status===409) throw Error('La funcionalidad cambió. Actualiza los datos antes de intentarlo de nuevo.')
  if(!response.ok) throw Error('No pudimos completar la funcionalidad. Vuelve a intentarlo.')
}
