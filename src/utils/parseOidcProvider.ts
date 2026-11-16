import type { OidcProvider } from '../types/OidcProvider'
import { requireRecord } from './requireRecord'
export function parseOidcProvider(value:unknown):OidcProvider {
  const v=requireRecord(value)
  if(!['id','name','issuer','client_id','redirect_uri','created_at','updated_at'].every(key=>typeof v[key]==='string')||typeof v.enabled!=='boolean'||!Number.isSafeInteger(v.revision)||Number(v.revision)<1)throw Error('La configuración de OpenID Connect no es válida.')
  return Object.fromEntries(['id','name','issuer','client_id','redirect_uri','created_at','updated_at','enabled','revision'].map(key=>[key,v[key]])) as OidcProvider
}
