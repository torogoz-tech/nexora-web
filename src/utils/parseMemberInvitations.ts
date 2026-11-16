import type { MemberInvitation } from '../types/MemberInvitation'
export function parseMemberInvitations(value:unknown):MemberInvitation[]{
  if(!Array.isArray(value)||!value.every(v=>v&&['id','email','name','expires_at','created_at'].every(k=>typeof v[k]==='string')&&['pending','accepted','revoked','expired'].includes(v.status)&&Number.isSafeInteger(v.revision)&&v.revision>0))throw Error('La configuración recibida no es válida.')
  return value as MemberInvitation[]
}
