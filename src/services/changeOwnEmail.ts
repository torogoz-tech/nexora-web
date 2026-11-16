import { apiFetch } from './apiFetch'
export async function changeOwnEmail(action: 'request' | 'verify', value: string) {
 const response=await apiFetch('/api/v1/me/email',{method:action==='request'?'POST':'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(action==='request'?{email:value}:{code:value})})
 if(response.ok)return
 const data=await response.json().catch(()=>({}))
 const title=typeof data.title==='string'?data.title:''
 if(title.includes('delivery is not configured'))throw Error('El administrador debe configurar el correo electrónico antes de verificar tu dirección.')
 if(title.includes('unavailable'))throw Error('No se puede utilizar esa dirección de correo.')
 if(title.includes('wait before'))throw Error('Espera 15 minutos antes de solicitar otro código.')
 if(title.includes('attempts exhausted'))throw Error('Se agotaron los intentos. Solicita un código nuevo.')
 if(title.includes('expired'))throw Error('El código venció. Solicita uno nuevo.')
 if(title.includes('unchanged'))throw Error('La dirección de correo no ha cambiado.')
 if(title.includes('email changed'))throw Error('El correo cambió en otra sesión. Solicita un código nuevo.')
 if(action==='verify'&&response.status===422)throw Error('El código de verificación no es correcto.')
 throw Error('No pudimos actualizar el correo. Inténtalo de nuevo.')
}
