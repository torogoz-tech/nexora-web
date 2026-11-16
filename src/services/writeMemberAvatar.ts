import { apiFetch } from './apiFetch'
export async function writeMemberAvatar(imageBase64:string|null,signal:AbortSignal,key:string) {
 const response=await apiFetch('/api/v1/me/avatar',{
  method:imageBase64===null?'DELETE':'PUT',signal,
  headers:{'Content-Type':'application/json','Idempotency-Key':key},
  ...(imageBase64===null?{}:{body:JSON.stringify({image_base64:imageBase64})}),
 })
 if(response.status===401)throw Error('La sesión terminó. Inicia sesión de nuevo.')
 if(response.status===403)throw Error('Solo puedes cambiar tu propia foto desde una sesión de usuario.')
 if(response.status===422||response.status===413)throw Error('Usa una imagen PNG, JPEG o WebP de hasta 2 MB y 4096 píxeles por lado.')
 if(!response.ok)throw Error('No pudimos guardar la foto. Vuelve a intentarlo.')
 const value:unknown=await response.json()
 if(!value||typeof value!=='object'||!('avatar_revision' in value)||!Number.isSafeInteger(value.avatar_revision)||Number(value.avatar_revision)<1)throw Error('La respuesta de la foto no es válida.')
 return Number(value.avatar_revision)
}
