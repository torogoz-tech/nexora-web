import { useState } from 'react'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { useTranslation } from '../hooks/useTranslation'
import { writeMemberInvitation } from '../services/writeMemberInvitation'
import IntegrationDialog from './IntegrationDialog'
import TextButton from './TextButton'
import type { InviteMemberModalProps } from '../types/InviteMemberModalProps'
export default function InviteMemberModal({onClose,onCreated}:InviteMemberModalProps){
  const {t}=useTranslation(),mutation=useIntegrationMutation()
  const [name,setName]=useState(''),[email,setEmail]=useState('')
  async function create(){
    const ok=await mutation.run({name,email},async(signal,key)=>{await writeMemberInvitation('/api/v1/settings/invitations',{name,email},signal,key)})
    if(ok)onCreated()
  }
  return <IntegrationDialog title={t('Invitar miembro')} busy={mutation.busy} onClose={()=>{if(!mutation.busy)onClose()}}><form autoComplete="off" className="space-y-4" onSubmit={e=>{e.preventDefault();void create()}}>
    <label className="flex flex-col gap-2 text-sm">{t('Nombre')}<input name="invitee-name" autoComplete="off" className="input w-full" required maxLength={160} value={name} onChange={e=>setName(e.target.value)} disabled={mutation.busy}/></label>
    <label className="flex flex-col gap-2 text-sm">{t('Correo electrónico')}<input name="invitee-email" autoComplete="off" autoCapitalize="none" spellCheck={false} className="input w-full" type="email" required maxLength={320} value={email} onChange={e=>setEmail(e.target.value)} disabled={mutation.busy}/></label>
    <p className="text-xs leading-relaxed text-base-content/55">{t('La invitación vence en 72 horas. La persona elegirá su usuario y contraseña. Los permisos de proyectos se asignan por separado.')}</p>
    {mutation.error&&<p role="alert" className="text-sm text-error">{t(mutation.error)}</p>}
    <div className="flex justify-end gap-2"><TextButton type="button" label={t('Cancelar')} disabled={mutation.busy} onClick={onClose}/><TextButton type="submit" variant="primary" label={t('Enviar invitación')} disabled={mutation.busy} aria-busy={mutation.busy}/></div>
  </form></IntegrationDialog>
}
