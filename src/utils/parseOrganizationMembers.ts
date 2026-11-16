import type { OrganizationMember } from '../types/OrganizationMember'
import { requireRecord } from './requireRecord'
export function parseOrganizationMembers(value:unknown):OrganizationMember[]{
  if(!Array.isArray(value))throw Error('La configuración recibida no es válida.')
  return value.map(item=>{
    const v=requireRecord(item)
    if(!['id','name','username','email'].every(k=>typeof v[k]==='string')||typeof v.active!=='boolean'
      ||(v.archived!==undefined&&typeof v.archived!=='boolean')
      ||(v.lifecycle_revision!==undefined&&(!Number.isSafeInteger(v.lifecycle_revision)||(v.lifecycle_revision as number)<0))
      ||(v.position !== undefined && typeof v.position !== 'string')
      ||(v.position_revision !== undefined && (!Number.isSafeInteger(v.position_revision) || (v.position_revision as number) < 0))
      ||(v.avatar_revision!==undefined&&(!Number.isSafeInteger(v.avatar_revision)||(v.avatar_revision as number)<0))
      ||['has_password','local_login_enabled'].some(k=>v[k]!==undefined&&typeof v[k]!=='boolean')
      ||['created_at','workflow_name','last_login_at'].some(k=>v[k]!=null&&typeof v[k]!=='string')
      ||(v.role!==undefined&&v.role!==null&&!['user', 'supervisor', 'developer','technical_lead','pmo','manager','super_admin'].includes(v.role as string))
      ||(v.role_all_projects!==undefined&&typeof v.role_all_projects!=='boolean')
      ||(v.role_project_ids!==undefined&&(!Array.isArray(v.role_project_ids)||!v.role_project_ids.every(id=>typeof id==='string')))
      ||(v.role_revision!==undefined&&(!Number.isSafeInteger(v.role_revision)||(v.role_revision as number)<0))
      ||(v.oidc_providers!==undefined&&(!Array.isArray(v.oidc_providers)||!v.oidc_providers.every(p=>p&&typeof p.name==='string'&&typeof p.enabled==='boolean'))))throw Error('La configuración recibida no es válida.')
    return {archived:v.archived??false,lifecycle_revision:v.lifecycle_revision??0,position:v.position??'',position_revision:v.position_revision??0,id:v.id,name:v.name,username:v.username,email:v.email,active:v.active,
      ...(v.avatar_revision!==undefined?{avatar_revision:v.avatar_revision}:{}),
      has_password:v.has_password??null,local_login_enabled:v.local_login_enabled??null,
      oidc_providers:v.oidc_providers?.map((p:{name:string;enabled:boolean})=>({name:p.name,enabled:p.enabled}))??null,
      last_login_at:v.last_login_at??null,created_at:v.created_at??null,workflow_name:v.workflow_name??null,
      ...(v.role!==undefined?{role:v.role}:{}),
      ...(v.role_all_projects!==undefined?{role_all_projects:v.role_all_projects}:{}),
      ...(v.role_project_ids!==undefined?{role_project_ids:[...v.role_project_ids]}:{}),
      ...(v.role_revision!==undefined?{role_revision:v.role_revision}:{})} as OrganizationMember
  })
}
