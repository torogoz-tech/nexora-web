import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useMemberAvatar } from '../hooks/useMemberAvatar'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { useTranslation } from '../hooks/useTranslation'
import { prepareMemberPhoto } from '../utils/prepareMemberPhoto'
import { settingsMutationSignature } from '../utils/settingsMutationSignature'
import { writeMemberAvatar } from '../services/writeMemberAvatar'
import type { OrganizationMember } from '../types/OrganizationMember'
import IntegrationDialog from './IntegrationDialog'
import TextButton from './TextButton'
export default function MemberPhoto({member}:{member:OrganizationMember}) {
 const {session}=useAuth()
 const {t}=useTranslation()
 const photo=useMemberAvatar(member.id,member.avatar_revision??0)
 const file=useRef<HTMLInputElement>(null)
 const preparation=useRef<AbortController|null>(null)
 const mutation=useIntegrationMutation()
 const mounted=useRef(true)
 const [options,setOptions]=useState(false)
 const [preparing,setPreparing]=useState(false)
 const [error,setError]=useState<string|null>(null)
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false;preparation.current?.abort()}},[])
 const own=session?.actorId===member.id
 const busy=preparing||mutation.busy
 const initials=member.name.trim().split(/\s+/).slice(0,2).map(value=>value[0]).join('').toLocaleUpperCase()
 async function save(image:string|null){
  const signature=await settingsMutationSignature({actorId:member.id,image})
  if(!mounted.current)return
  await mutation.run(signature,async(signal,key)=>{
   const revision=await writeMemberAvatar(image,signal,key)
   if(!signal.aborted){setOptions(false);window.dispatchEvent(new CustomEvent('nexora:avatar-changed',{detail:{actorId:member.id,revision}}))}
  })
 }
 async function select(image:File){
  if(busy||preparation.current)return
  const controller=new AbortController();preparation.current=controller;setPreparing(true);setError(null)
  try{const encoded=await prepareMemberPhoto(image,controller.signal);controller.signal.throwIfAborted();await save(encoded)}
  catch(failure){if(!controller.signal.aborted)setError(failure instanceof Error?failure.message:'No pudimos preparar la imagen. Vuelve a intentarlo.')}
  finally{preparation.current=null;if(!controller.signal.aborted)setPreparing(false)}
 }
 const content=<>{photo?<img src={photo} alt={t('Foto de {0}',{'0':member.name})} className="size-full object-cover"/>:<span aria-hidden="true">{initials||'?'}</span>}{busy&&<span aria-hidden="true" className="absolute inset-0 flex items-center justify-center bg-base-100/75"><span className="loading loading-spinner loading-sm"/></span>}</>
 const classes='relative mb-5 flex p-0 size-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-primary/20 bg-primary/10 text-4xl font-bold tracking-tight text-primary'
 return <>
  {own?<><button type="button" aria-label={t(photo?'Cambiar foto':'Agregar foto')} title={t(photo?'Cambiar foto':'Agregar foto')} aria-busy={busy} disabled={busy} onClick={()=>photo?setOptions(true):file.current?.click()} className={`${classes} group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary`}>{content}{!busy&&<span className="absolute inset-0 flex items-center justify-center bg-base-100/70 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"><ImagePlus size={24}/></span>}</button><input ref={file} type="file" className="hidden" aria-label={t('Seleccionar foto')} accept="image/png,image/jpeg,image/webp,.png,.jpg,.jpeg,.webp" disabled={busy} onChange={event=>{const selected=event.target.files?.[0];event.target.value='';if(selected)void select(selected)}}/></>:<div className={classes}>{content}</div>}
  {(error||mutation.error)&&<p role="alert" className="mb-4 text-xs text-error">{t(error??mutation.error)}<span className="mt-1 block">{t('Pulsa tu foto para cambiarla. PNG, JPEG o WebP de hasta 2 MB.')}</span></p>}
  {options&&<IntegrationDialog title={t('Foto de perfil')} busy={busy} onClose={()=>{if(!busy)setOptions(false)}}><p className="mb-5 text-sm text-base-content/60">{t('Puedes reemplazar tu foto o volver al avatar con tus iniciales.')}</p>{mutation.error&&<p role="alert" className="mb-4 text-sm text-error">{t(mutation.error)}</p>}<div className="flex flex-wrap justify-end gap-2"><TextButton label={t('Cancelar')} disabled={busy} onClick={()=>setOptions(false)}/><TextButton label={t('Eliminar foto')} variant="error" disabled={busy} onClick={()=>void save(null)}><Trash2 size={16}/></TextButton><TextButton label={t('Reemplazar foto')} variant="primary" disabled={busy} onClick={()=>{setOptions(false);file.current?.click()}}><ImagePlus size={16}/></TextButton></div></IntegrationDialog>}
 </>
}
