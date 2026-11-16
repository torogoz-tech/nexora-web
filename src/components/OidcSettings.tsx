import { useState } from 'react'
import LocalLoginSettings from './LocalLoginSettings'
import { Plus } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useTranslation } from '../hooks/useTranslation'
import { parseOidcSettingsPage } from '../utils/parseOidcSettingsPage'
import type { OidcProvider } from '../types/OidcProvider'
import OidcProviderCreateForm from './OidcProviderCreateForm'
import OidcProviderEditor from './OidcProviderEditor'
import Dropdown from './Dropdown'
import IconButton from './IconButton'
import DataMessage from './DataMessage'
export default function OidcSettings(){
  const {t}=useTranslation()
  const remote=useApiData('/api/v1/auth/oidc/providers',parseOidcSettingsPage)
  const [updates,setUpdates]=useState<Record<string,OidcProvider>>({})
  const [selected,setSelected]=useState('')
  const [creating,setCreating]=useState(false)
  const merged=new Map(remote.data?.items.map(provider=>[provider.id,provider]))
  Object.values(updates).forEach(provider=>{if(!merged.has(provider.id)||merged.get(provider.id)!.revision<=provider.revision)merged.set(provider.id,provider)})
  const providers=[...merged.values()]
  const current=providers.find(provider=>provider.id===selected)??providers[0]
  const callback=remote.data?.callback_url??`${window.location.origin}/api/v1/auth/oidc/callback`
  const blocked=!!remote.data?.allowed_callback_origins.length&&!remote.data.allowed_callback_origins.includes(window.location.origin)
  const update=(provider:OidcProvider)=>setUpdates(values=>({...values,[provider.id]:provider}))
  return <section aria-label="OpenID Connect" className="py-6">
    <div className="flex items-center justify-between gap-3"><h2 className="text-base font-semibold">{t('Acceso corporativo (OpenID Connect)')}</h2><IconButton label={t('Agregar proveedor')} disabled={creating||remote.loading||!!remote.error} onClick={()=>setCreating(true)}><Plus size={16}/></IconButton></div>
    <p className="mt-2 text-xs leading-relaxed text-base-content/50">{t('Permite iniciar sesión con Microsoft Entra ID, Google u otro proveedor OpenID Connect autorizado por el servidor. Este acceso es independiente de las conexiones con GitHub y GitLab.')}</p>
    <p className="mt-2 text-xs leading-relaxed text-base-content/50">{t('Registra esta URL de retorno en tu proveedor:')} <span className="break-all font-mono">{callback}</span></p>
    {blocked&&<p role="alert" className="mt-3 text-xs text-warning">{t('La URL de retorno se obtiene de la URL pública guardada en General. Comprueba que coincida con la registrada en tu proveedor.')}</p>}
    {remote.loading||remote.error?<DataMessage loading={remote.loading} error={remote.error} onRetry={remote.reload}/>:<>
      {remote.data&&<LocalLoginSettings settings={remote.data} onUpdated={remote.reload}/>}
      {providers.length>1&&!creating&&<div className="mt-5"><Dropdown label={t('Proveedor de acceso corporativo')} value={current?.id??''} options={providers.map(provider=>({value:provider.id,label:provider.name}))} onChange={setSelected}/></div>}
      {creating?<OidcProviderCreateForm callback={callback} onCancel={()=>setCreating(false)} onCreated={provider=>{update(provider);setSelected(provider.id);setCreating(false)}}/>:current?<OidcProviderEditor key={current.id} provider={current} onUpdated={update} onReload={remote.reload}/>:<p className="mt-5 text-sm text-base-content/55">{t('Todavía no hay proveedores de acceso corporativo configurados.')}</p>}
      <p className="mt-5 text-xs leading-relaxed text-base-content/50">{t('OpenID Connect no sustituye automáticamente al usuario y contraseña. Los nuevos usuarios corporativos esperan a que el administrador les asigne un rol.')}</p>
    </>}
  </section>
}
