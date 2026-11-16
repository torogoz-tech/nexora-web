import {apiFetch} from './apiFetch'
import {requireRecord} from '../utils/requireRecord'
export async function uploadRatingEvidence(actorId:string,projectId:string,file:File,image=false){
 if(!file.size||file.size>20*1024*1024)throw Error('El archivo admite hasta 20 MB.')
 if(image&&(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>4*1024*1024))throw Error('Usa una imagen PNG, JPEG o WebP de hasta 4 MB.')
 const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192))
 const name=Array.from(file.name||'evidence').map(c=>(c.codePointAt(0)??0)<32||c==='/'||c==='\\'?'_':c).join('');if(new TextEncoder().encode(name).length>240)throw Error('El nombre del archivo es demasiado largo.')
 const response=await apiFetch(`/api/v1/members/${encodeURIComponent(actorId)}/rating-evidence`,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':crypto.randomUUID()},body:JSON.stringify({project_id:projectId,name,image,data_base64:btoa(binary)})})
 if(!response.ok)throw Error('No pudimos guardar la evidencia.')
 const result=requireRecord(await response.json());if(typeof result.id!=='string'||!/^rev_[a-zA-Z0-9_]+$/.test(result.id)||result.url!==`/api/v1/rating-evidence/${result.id}/content`)throw Error('La respuesta de la evidencia no es válida.')
 return {id:result.id,name,url:String(result.url),image}
}
