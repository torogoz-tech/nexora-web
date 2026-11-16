import { apiFetch } from './apiFetch'
import { parseOidcProvider } from '../utils/parseOidcProvider'
export async function writeOidcConfiguration(path:string,method:'POST'|'PATCH',input:unknown,signal:AbortSignal,key:string) {
  if(!/^\/api\/v1\/auth\/oidc\/providers(?:\/[A-Za-z0-9_-]+)?$/.test(path))throw Error('invalid-oidc-path')
  const response=await apiFetch(path,{method,signal,headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(input)})
  if(!response.ok){
    const problem=await response.json().catch(()=>null)
    const title=typeof problem?.title==='string'?problem.title:''
    if(response.status===403)throw Error('No tienes permisos para administrar la configuración global.')
    if(response.status===401)throw Error('La sesión terminó. Inicia sesión de nuevo.')
    if(response.status===409){
      if(title.includes('last corporate administrator'))throw Error('No puedes desactivar el último acceso corporativo de administración mientras el acceso local esté deshabilitado.')
      throw Error('La configuración cambió en otra sesión. Revisa los datos actualizados y vuelve a intentarlo.')
    }
    if(response.status===422){
      if(title.includes('requires a new client secret'))throw Error('Al cambiar Client ID o URL de retorno, introduce de nuevo el Client secret.')
      if(title.includes('origin is outside operator policy'))throw Error('El dominio del proveedor no está permitido por el servidor. Solicita que se autorice antes de configurarlo.')
      if(title.includes('callback is outside operator policy'))throw Error('La URL de retorno no está permitida por el servidor. Debe usar el dominio de esta web y la ruta indicada.')
      throw Error('Revisa el nombre, Issuer, Client ID, Client secret y URL de retorno.')
    }
    throw Error('No pudimos guardar los cambios. Vuelve a intentarlo.')
  }
  return parseOidcProvider(await response.json())
}
