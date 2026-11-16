import { requireRecord } from './requireRecord'
import { parseOidcProvider } from './parseOidcProvider'
import type { OidcSettingsPage } from '../types/OidcSettingsPage'
export function parseOidcSettingsPage(value:unknown):OidcSettingsPage {
  const v=requireRecord(value)
  if(!Array.isArray(v.items)||!['allowed_provider_origins','allowed_callback_origins'].every(key=>v[key]===undefined||(Array.isArray(v[key])&&v[key].every((item:unknown)=>typeof item==='string'))))throw Error('La configuración de OpenID Connect no es válida.')
  return {callback_url:typeof v.callback_url==='string'?v.callback_url:undefined,local_enabled:typeof v.local_enabled==='boolean'?v.local_enabled:undefined,policy_revision:typeof v.policy_revision==='number'?v.policy_revision:undefined,can_disable_local:v.can_disable_local===true,items:v.items.map(parseOidcProvider),allowed_provider_origins:(v.allowed_provider_origins??[]) as string[],allowed_callback_origins:(v.allowed_callback_origins??[]) as string[]}
}
