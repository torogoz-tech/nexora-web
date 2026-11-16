import { useState } from 'react'
import { Archive, ArchiveRestore } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { apiFetch } from '../services/apiFetch'
import type { OrganizationMember } from '../types/OrganizationMember'
import IconButton from './IconButton'
import IntegrationDialog from './IntegrationDialog'
import TextButton from './TextButton'
export default function MemberArchiveAction({member,onSaved}:{member:OrganizationMember;onSaved:()=>void}){
 const {session}=useAuth(),{t}=useTranslation();const [open,setOpen]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('')
 if(member.id===session?.actorId||member.role==='super_admin')return null
 const label=member.archived?'Restaurar usuario':'Archivar usuario'
 async function change(){setBusy(true);setError('');try{
  const response=await apiFetch(`/api/v1/settings/members/${encodeURIComponent(member.id)}/lifecycle`,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({archived:!member.archived,expected_revision:member.lifecycle_revision??0})})
  if(!response.ok)throw Error(response.status===409?'El usuario cambió en otra sesión. Actualiza la lista.':'No pudimos actualizar el usuario. Inténtalo de nuevo.')
  setOpen(false);onSaved()
 }catch(failure){setError(failure instanceof Error?failure.message:'No pudimos actualizar el usuario. Inténtalo de nuevo.')}finally{setBusy(false)}}
 return <><IconButton label={t(label)} onClick={()=>{setError('');setOpen(true)}}>{member.archived?<ArchiveRestore size={17}/>:<Archive size={17}/>}</IconButton>{open&&<IntegrationDialog title={t(label)} busy={busy} onClose={()=>setOpen(false)}><p className="mb-3 font-medium">{member.name}</p><p className="text-sm leading-relaxed text-base-content/65">{t(member.archived?'El usuario recuperará el estado que tenía antes de archivarse y deberá iniciar sesión nuevamente.':'El usuario dejará de tener acceso. Se cerrarán sus sesiones y se revocarán sus API keys. Sus tareas, contribuciones e historial se conservarán.')}</p>{error&&<p role="alert" className="mt-4 text-sm text-error">{t(error)}</p>}<div className="mt-6 flex justify-end gap-2"><TextButton label={t('Cancelar')} disabled={busy} onClick={()=>setOpen(false)}/><TextButton variant="primary" label={t(label)} disabled={busy} aria-busy={busy} onClick={()=>void change()}/></div></IntegrationDialog>}</>
}
