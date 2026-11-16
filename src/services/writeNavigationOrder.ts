import { apiFetch } from './apiFetch'
import { parseNavigationOrder } from '../utils/parseNavigationOrder'
export async function writeNavigationOrder(paths:string[],revision:number,signal:AbortSignal,key:string){
 const response=await apiFetch('/api/v1/settings/navigation',{method:'PUT',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({paths,expected_revision:revision}),signal})
 if(!response.ok)throw Error(response.status===409?'El orden cambió. Actualiza la página para continuar.':'No pudimos guardar el orden del menú.')
 return parseNavigationOrder(await response.json())
}
