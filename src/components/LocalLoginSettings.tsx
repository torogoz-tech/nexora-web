import { useState } from 'react'
import type { OidcSettingsPage } from '../types/OidcSettingsPage'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { apiFetch } from '../services/apiFetch'
export default function LocalLoginSettings({settings,onUpdated}:{settings:OidcSettingsPage;onUpdated:()=>void}) {
 const {language}=useTranslation()
 const en=language==='en'
 const auth=useAuth()
 const [busy,setBusy]=useState(false)
 const [error,setError]=useState('')
 if(settings.local_enabled===undefined)return null
 const enabled=settings.local_enabled
 async function change(){
  if(busy||(!settings.can_disable_local&&enabled))return
  setBusy(true);setError('')
  try{
   const response=await apiFetch('/api/v1/auth/methods',{method:'PUT',headers:{'Content-Type':'application/json','Idempotency-Key':crypto.randomUUID()},body:JSON.stringify({expected_revision:settings.policy_revision,local_enabled:!enabled})})
   if(!response.ok)throw Error(en?'We could not update sign-in methods. Verify corporate administrator access first.':'No pudimos actualizar los métodos de acceso. Comprueba primero el acceso corporativo de un administrador.')
   onUpdated()
   if(enabled)await auth.logout()
  }catch(failure){setError(failure instanceof Error?failure.message:'Error')}
  finally{setBusy(false)}
 }
 return <section className="my-6 border-y border-base-300 py-5">
  <div className="flex items-start justify-between gap-5"><div><h3 className="text-sm font-medium">{en?'Username and password':'Usuario y contraseña'}</h3><p className="mt-2 text-xs leading-relaxed text-base-content/60">{en?'Both methods can coexist. Turning this off prevents password sign-in and ends existing local sessions.':'Ambos métodos pueden coexistir. Al desactivarlo se impide entrar con contraseña y se cierran las sesiones locales existentes.'}</p></div><input aria-label={en?'Allow username and password':'Permitir usuario y contraseña'} type="checkbox" className="toggle toggle-sm shrink-0" checked={enabled} disabled={busy||(enabled&&!settings.can_disable_local)} onChange={()=>void change()}/></div>
  <p className="mt-3 text-xs text-base-content/55">{settings.can_disable_local?(en?'Corporate administrator access is verified. You may disable password sign-in.':'El acceso corporativo de un administrador está comprobado. Puedes deshabilitar el acceso con contraseña.'):(en?'Keep password sign-in enabled until an administrator signs in successfully using OpenID Connect and completes the required verification.':'Mantén el acceso con contraseña hasta que un administrador ingrese correctamente con OpenID Connect y complete la verificación requerida.')}</p>
  {error&&<p role="alert" className="mt-3 text-xs text-error">{error}</p>}
 </section>
}
