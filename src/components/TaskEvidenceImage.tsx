import { useEffect, useState } from 'react'
import { apiFetch } from '../services/apiFetch'
import { useTranslation } from '../hooks/useTranslation'
export default function TaskEvidenceImage({src,alt,compact=false}: {src:string;alt:string;compact?:boolean}) {
 const {t}=useTranslation(),[image,setImage]=useState<{src:string;url:string}|null>(null),[failed,setFailed]=useState<string>()
 useEffect(()=>{
  const controller=new AbortController();const resource:{url?:string}={}
  void apiFetch(src,{signal:controller.signal,cache:'no-store'}).then(async response=>{
   if(!response.ok||response.headers.get('content-type')?.split(';')[0]!=='image/png')throw Error()
   const blob=await response.blob();if(!blob.size||blob.size>8*1024*1024)throw Error()
   if(controller.signal.aborted)return
   resource.url=URL.createObjectURL(blob);setImage({src,url:resource.url})
  }).catch(()=>{if(!controller.signal.aborted)setFailed(src)})
  return()=>{controller.abort();if(resource.url)URL.revokeObjectURL(resource.url)}
 },[src])
 return image?.src===src ? <img src={image.url} alt={alt} className={compact?"my-2 size-24 rounded-xl object-contain":"my-4 max-h-[36rem] max-w-full rounded-xl object-contain"}/> : <span role="status" className="my-4 block rounded-xl bg-base-200 p-3 text-xs text-base-content/50">{t(failed===src?'No pudimos cargar esta evidencia.':'Cargando evidencia…')}</span>
}
