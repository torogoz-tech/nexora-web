import type { InvitationDetails } from '../types/InvitationDetails'
export function parseInvitationDetails(value:unknown):InvitationDetails{
  if(!value||typeof value!=='object'||!['name','email','organization_name','expires_at'].every(k=>typeof (value as Record<string,unknown>)[k]==='string'))throw Error('La configuración recibida no es válida.')
  return value as InvitationDetails
}
