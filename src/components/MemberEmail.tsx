import { useState } from 'react'
import { Mail, Pencil } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { parseOwnEmail } from '../utils/parseOwnEmail'
import { changeOwnEmail } from '../services/changeOwnEmail'
import type { OrganizationMember } from '../types/OrganizationMember'
import IconButton from './IconButton'
import TextButton from './TextButton'
import IntegrationDialog from './IntegrationDialog'
import MemberEmailVerificationDialog from './MemberEmailVerificationDialog'
export default function MemberEmail({member}:{member:OrganizationMember}) {
 const {session}=useAuth();const {t}=useTranslation();const own=session?.actorId===member.id
 const state=useApiData(own?'/api/v1/me/email':null,parseOwnEmail)
 const [open,setOpen]=useState(false),[email,setEmail]=useState(''),[pending,setPending]=useState(false),[code,setCode]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('')
 async function submit(){
  if(busy)return;setBusy(true);setError('')
  try{await changeOwnEmail(pending?'verify':'request',pending?code:email);state.reload();if(pending)setOpen(false);else {setPending(true);setCode('')}}
  catch(failure){setError(failure instanceof Error?failure.message:'No pudimos actualizar el correo. Inténtalo de nuevo.')}
  finally{setBusy(false)}
 }
 return <div><dt className="mb-1 flex items-center gap-2 text-xs text-base-content/45"><Mail size={14}/>{t('Correo')}{own&&<IconButton label={t('Editar correo')} onClick={()=>{setEmail(state.data?.pending_email||state.data?.email||state.data?.suggested_email||member.email);setPending(!!state.data?.pending_email);setCode('');setError('');setOpen(true)}}><Pencil size={13}/></IconButton>}</dt><dd className="break-words text-base-content/75">{state.data?.email||member.email||t('Sin correo configurado')}</dd>
 {own&&state.data?.pending_email&&<p className="mt-1 text-xs text-base-content/50">{t('Pendiente de verificar')}: {state.data.pending_email}</p>}
 {open&&!pending&&<IntegrationDialog key="email-address" title={t('Editar correo')} busy={busy} onClose={()=>setOpen(false)}><form className="space-y-5" onSubmit={event=>{event.preventDefault();void submit()}}>
 <label className="flex flex-col gap-2 text-sm">{t('Correo electrónico')}<input autoFocus type="email" className="input w-full" autoComplete="email" maxLength={254} required disabled={busy} value={email} onChange={event=>setEmail(event.target.value)}/></label>
 <p className="text-sm leading-relaxed text-base-content/60">{t('Verificaremos la nueva dirección antes de cambiar el correo de tu cuenta. Esto no modifica tu identidad ni tus permisos de OIDC.')}</p>
 {error&&<p role="alert" className="text-sm text-error">{t(error)}</p>}
 <div className="flex justify-end gap-2"><TextButton type="button" label={t('Cancelar')} disabled={busy} onClick={()=>setOpen(false)}/><TextButton type="submit" variant="primary" label={t('Enviar código')} disabled={busy} aria-busy={busy}/></div>
 </form></IntegrationDialog>}
 {open&&pending&&<MemberEmailVerificationDialog email={email} code={code} busy={busy} error={error} onCodeChange={setCode} onVerify={()=>void submit()} onClose={()=>setOpen(false)} onChangeAddress={()=>{setPending(false);setCode('');setError('')}}/>}</div>
}
