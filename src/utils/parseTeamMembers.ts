import type {TeamMember} from '../types/TeamMember'
export function parseTeamMembers(value:unknown):TeamMember[]{
 if(!Array.isArray(value)||value.some(item=>!item||typeof item.id!=='string'||typeof item.name!=='string'||typeof item.position!=='string'||!['developer','technical_lead','pmo','manager','super_admin'].includes(item.role)||!Number.isSafeInteger(item.avatar_revision)||item.avatar_revision<0))throw Error('La configuración recibida no es válida.')
 return value.map(item=>({id:item.id,name:item.name,position:item.position,role:item.role,avatar_revision:item.avatar_revision}))
}
