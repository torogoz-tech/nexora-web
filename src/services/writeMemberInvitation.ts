import { apiFetch } from './apiFetch'
export async function writeMemberInvitation(path:string,body:unknown,signal:AbortSignal,key:string){
  const response=await apiFetch(path,{method:'POST',signal,headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify(body)})
  if(response.status===403)throw Error('No tienes permisos para administrar miembros.')
  if(response.status===409)throw Error('La invitación cambió o el correo ya pertenece a un miembro. Actualiza el listado.')
  if(response.status===422){
    const problem=await response.json().catch(()=>null)
    if(String(problem?.title).includes('configure public web URL'))throw Error('Configura la URL pública, el servidor SMTP y el acceso local antes de invitar miembros.')
    throw Error('Revisa el nombre y el correo de la invitación.')
  }
  if(!response.ok)throw Error('No pudimos guardar la invitación. Vuelve a intentarlo.')
  return response.json()
}
