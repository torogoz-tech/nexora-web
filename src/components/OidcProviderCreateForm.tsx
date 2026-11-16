import { useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { writeOidcConfiguration } from '../services/writeOidcConfiguration'
import type { OidcProviderCreateFormProps } from '../types/OidcProviderCreateFormProps'
import SettingsRow from './SettingsRow'
import TextButton from './TextButton'
export default function OidcProviderCreateForm({onCreated,onCancel,callback}:OidcProviderCreateFormProps){
  const {t}=useTranslation()
  const mutation=useIntegrationMutation()
  const [draft,setDraft]=useState({name:'',issuer:'',client_id:'',client_secret:'',redirect_uri:callback})
  return <form className="mt-5" onSubmit={event=>{event.preventDefault();void mutation.run({operation:'create',...draft},async(signal,key)=>{onCreated(await writeOidcConfiguration('/api/v1/auth/oidc/providers','POST',{...draft,enabled:true,expected_revision:0},signal,key))})}}>
    <fieldset disabled={mutation.busy}>
      {([['name','Nombre del proveedor','text',160],['issuer','Issuer (URL del emisor)','url',2048],['client_id','Client ID','text',512],['client_secret','Client secret','password',8192],['redirect_uri','URL de retorno','url',2048]] as const).map(([name,label,type,max])=><SettingsRow key={name} label={t(label)}><input aria-label={t(label)} className="input input-sm w-full" type={type} required maxLength={max} autoComplete={type==='password'?'new-password':'off'} spellCheck={false} value={draft[name]} onChange={event=>setDraft(current=>({...current,[name]:event.target.value}))}/></SettingsRow>)}
    </fieldset>
    {mutation.error&&<p role="alert" className="mt-3 text-sm text-error">{t(mutation.error)}</p>}
    <div className="mt-5 flex justify-end gap-2"><TextButton type="button" label={t('Cancelar')} disabled={mutation.busy} onClick={onCancel}/><TextButton type="submit" variant="primary" label={t('Agregar proveedor')} disabled={mutation.busy} aria-busy={mutation.busy}/></div>
  </form>
}
