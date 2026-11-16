import { apiFetch } from './apiFetch'
import { requireRecord } from '../utils/requireRecord'
export async function uploadTaskEvidence(file: File, signal?: AbortSignal) {
 if (!['image/png','image/jpeg','image/webp'].includes(file.type) || !file.size || file.size>4*1024*1024) throw Error('Usa una imagen PNG, JPEG o WebP de hasta 4 MB.')
 let name='';for(const character of file.name||'evidence.png'){if((character.codePointAt(0)??0)<32)continue;if(new TextEncoder().encode(name+character).length>200)break;name+=character}if(!name.trim())name='evidence.png'
 const bytes=new Uint8Array(await file.arrayBuffer())
 let binary=''; for(let start=0;start<bytes.length;start+=8192) binary+=String.fromCharCode(...bytes.subarray(start,start+8192))
 const response=await apiFetch('/api/v1/task-evidence',{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':crypto.randomUUID()},body:JSON.stringify({name,image_base64:btoa(binary)}),signal})
 if(!response.ok) throw Error(response.status===422 ? 'La imagen no es válida o hay demasiadas imágenes pendientes.' : 'No pudimos guardar la imagen. Vuelve a pegarla para reintentar.')
 const value=requireRecord(await response.json())
 if(typeof value.id!=='string'||!/^tev_[a-zA-Z0-9_]+$/.test(value.id)||value.url!==`/api/v1/task-evidence/${value.id}/content`) throw Error('La respuesta de la evidencia no es válida.')
 return {url:String(value.url),name:file.name||'Imagen'}
}
