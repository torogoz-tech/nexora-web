import { WorkspacePermissionsContext } from '../src/app/WorkspacePermissionsContext'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { parseOrganizationMembers } from '../src/utils/parseOrganizationMembers'
import MembersPage from '../src/pages/MembersPage'
import MemberProfile from '../src/components/MemberProfile'
import { MemoryRouter } from 'react-router'
const member={id:'person',name:'Ana',username:'ana',email:'ana@example.invalid',active:true,has_password:true,local_login_enabled:true,oidc_providers:[{name:'Corporate',enabled:true}],created_at:'2026-11-07T00:00:00Z',workflow_name:'Desarrollo'}
const invitations=['pending','expired','revoked','accepted'].map(status=>({id:status,name:`Invite ${status}`,email:`${status}@example.invalid`,status,expires_at:'2026-12-01T00:00:00Z',created_at:'2026-11-07T00:00:00Z',revision:1}))
vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>({session:{actorId:'person'}})}))
vi.mock('../src/hooks/useApiData',()=>({useApiData:(path:string|null)=>({data:path?.endsWith('/members')?[member]:path?invitations:null,loading:false,error:null,reload:vi.fn()})}))
it('renders a unified table directory with invitation states and both access methods',()=>{
 const html=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(WorkspacePermissionsContext.Provider,{value:{actor_id:'admin',role:'super_admin',grants:[{capability:'installation:manage',project_id:null}]}},createElement(MembersPage))))
 expect(html).toContain('<table')
 expect(html).toContain('Usuario y contraseña')
 expect(html).toContain('OIDC')
 expect(html).not.toContain('OpenID Connect ·')
 expect(html).toContain('Invitación pendiente')
 expect(html).toContain('Invitación vencida')
 expect(html).toContain('Invitación revocada')
 expect(html).not.toContain('Invite accepted')
 expect(html).toContain('Ver perfil de Ana')
 expect(html).toContain('href="/settings/members/person"')
 expect(html).toContain('Último ingreso')
})
it('renders member profile details, workflow and authentication without secrets',()=>{
 const html=renderToStaticMarkup(createElement(MemberProfile,{member}))
 for(const value of ['Perfil del miembro','ana@example.invalid','Desarrollo','Corporate','Usuario y contraseña'])expect(html).toContain(value)
 expect(html).not.toContain('password_hash')
})
it('does not guess password authentication when older servers omit identity metadata',()=>{
 const parsed=parseOrganizationMembers([{id:'old',name:'Old',username:'old',email:'',active:true}])[0]
 expect(parsed.has_password).toBeNull()
 expect(parsed.oidc_providers).toBeNull()
 expect(()=>parseOrganizationMembers([{...member,has_password:'true'}])).toThrow()
})
it('retains only public profile and provider metadata',()=>{
 const parsed=parseOrganizationMembers([{...member,password_hash:'private',oidc_providers:[{name:'Corporate',enabled:true,client_secret:'private'}]}])[0]
 expect(JSON.stringify(parsed)).not.toContain('private')
})

it('technical leads see member scope access without position, archive or invitation actions',()=>{
 const html=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(WorkspacePermissionsContext.Provider,{value:{actor_id:'lead',role:'technical_lead',grants:[{capability:'members:read',project_id:null},{capability:'member-projects:manage',project_id:'project'}]}},createElement(MembersPage))))
 expect(html).not.toContain('Invitar miembro')
 expect(html).not.toContain('Editar posición')
 expect(html).not.toContain('Archivar usuario')
})
