import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from '../hooks/useTranslation'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { writeOidcConfiguration } from '../services/writeOidcConfiguration'
import type { OidcProviderEditorProps } from '../types/OidcProviderEditorProps'
import SettingsRow from './SettingsRow'
import AutosaveTextField from './AutosaveTextField'
export default function OidcProviderEditor({provider,onUpdated,onReload}:OidcProviderEditorProps){
  const {t}=useTranslation()
  const mutation=useIntegrationMutation()
  const mounted=useRef(true)
  useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[])
  const current=useRef(provider)
  const queue=useRef<Promise<unknown>>(Promise.resolve())
  const pending=useRef<Record<string,string>>({})
  const [secretReset,setSecretReset]=useState(0)
  useLayoutEffect(()=>{if(provider.revision>=current.current.revision)current.current=provider},[provider])
  function save(patch:Record<string,string|boolean>):Promise<boolean>{
    const operation=queue.current.then(async()=>{
      if(!mounted.current)return false
      const saved=await mutation.run({id:provider.id,revision:current.current.revision,...patch},async(signal,key)=>{
        const next=await writeOidcConfiguration(`/api/v1/auth/oidc/providers/${encodeURIComponent(provider.id)}`,'PATCH',{...patch,expected_revision:current.current.revision},signal,key)
        current.current=next;onUpdated(next)
      })
      if(!saved)onReload()
      return saved
    })
    queue.current=operation.catch(()=>false)
    return operation
  }
  function saveIdentity(field:string,value:string){
    pending.current[field]=value
    const patch={...pending.current}
    return save(patch).then(ok=>{if(ok)clearPending(patch);return ok})
  }
  function clearPending(patch:Record<string,string>){
    Object.entries(patch).forEach(([key,value])=>{if(pending.current[key]===value)delete pending.current[key]})
  }
  return <div className="mt-3">
    <SettingsRow label={t('Activado')} description={t('Al desactivar este proveedor se cierran sus sesiones de acceso corporativo.')}><div className="flex justify-end"><input type="checkbox" role="switch" className="toggle toggle-sm" aria-label={t('Activar OpenID Connect')} checked={provider.enabled} disabled={mutation.busy} onChange={event=>void save({enabled:event.target.checked})}/></div></SettingsRow>
    <SettingsRow label={t('Nombre del proveedor')}><AutosaveTextField autoSave label={t('Nombre del proveedor')} value={provider.name} maxLength={160} saveBlocked={mutation.busy} onCommit={value=>save({name:value})}/></SettingsRow>
    <SettingsRow label={t('Issuer (URL del emisor)')} description={t('El emisor identifica al proveedor y no cambia después de crearlo. Para otro emisor, agrega un proveedor nuevo.')}><p className="break-all py-1.5 text-sm text-base-content/70">{provider.issuer}</p></SettingsRow>
    <SettingsRow label="Client ID" description={t('Al cambiar Client ID o URL de retorno, introduce de nuevo el Client secret.')}><AutosaveTextField autoSave label="Client ID" value={provider.client_id} maxLength={512} saveBlocked={mutation.busy} onCommit={value=>saveIdentity('client_id',value)}/></SettingsRow>
    <SettingsRow label={t('URL de retorno')}><AutosaveTextField autoSave label={t('URL de retorno')} type="url" value={provider.redirect_uri} maxLength={2048} saveBlocked={mutation.busy} onCommit={value=>saveIdentity('redirect_uri',value)}/></SettingsRow>
    <SettingsRow label="Client secret" description={t('La credencial se cifra en el servidor y nunca se devuelve al navegador.')}><AutosaveTextField key={secretReset} autoSave label="Client secret" type="password" value="" maxLength={8192} saveBlocked={mutation.busy} placeholder={t('Configurado; introduce uno nuevo para reemplazarlo')} onCommit={async value=>{if(!value.trim())return true;const patch={...pending.current};const ok=await save({...patch,client_secret:value});if(ok){clearPending(patch);setSecretReset(n=>n+1)}return ok}}/></SettingsRow>
    {mutation.error&&<p role="alert" className="mt-2 text-xs text-error">{t(mutation.error)}</p>}
  </div>
}
