import type { OwnEmail } from '../types/OwnEmail'
export function parseOwnEmail(value: unknown): OwnEmail {
 if(!value || typeof value!=='object' || !('email' in value) || typeof value.email!=='string' || !('suggested_email' in value) || value.suggested_email!==null && typeof value.suggested_email!=='string' || !('pending_email' in value) || value.pending_email!==null && typeof value.pending_email!=='string')throw Error('La configuración recibida no es válida.')
 return {email:value.email,suggested_email:value.suggested_email,pending_email:value.pending_email}
}
