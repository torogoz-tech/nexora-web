import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import { parseMemberProfile } from '../src/utils/parseMemberProfile'
import { profileContributionWeeks } from '../src/utils/profileContributionWeeks'
import MemberProfilePage from '../src/pages/MemberProfilePage'
import UserMenu from '../src/components/UserMenu'
import { WorkspacePermissionsContext } from '../src/app/WorkspacePermissionsContext'
const data={member:{id:'person',name:'Ana Developer',username:'ana',email:'ana@example.invalid',active:true,has_password:true,local_login_enabled:true,oidc_providers:[],created_at:'2024-01-01',workflow_name:'Desarrollo',role:'developer',role_all_projects:true,role_project_ids:[],role_revision:1},projects:[{id:'p1',name:'Smart Ticket'}],repositories:[{id:'repo',project_id:'p1',name:'team/product',provider:'github',status:'active'}],priority_tasks:[{id:'task',project_id:'p1',title:'Implement OTP',priority:'high'}],contributions:[{date:'2026-01-01',count:3}],activity:[{id:'event',project_id:'p1',kind:'task',title:'Implement OTP',created_at:'2026-01-01T00:00:00Z'}],year:2026}
vi.mock('../src/hooks/useTheme',()=>({useTheme:()=>({isDark:true,toggleTheme:vi.fn()})}))
vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>({session:{actorId:'person'}})}))
vi.mock('../src/hooks/useApiData',()=>({useApiData:(path:string)=>({data:path==='/api/v1/labor-calendar'?null:path==='/api/v1/me/mcp-keys'?null:path.includes('/git-aliases?')?{items:[],has_more:false,next_after:null}:path.includes('/ratings?')?{actor_id:'person',year:2026,annual:null,daily:[],weekly:[],monthly:[],can_rate:false}:data,loading:false,error:null,reload:vi.fn()})}))
it('renders the profile as a standalone Codelo-style page with real activity',()=>{
 const html=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(WorkspacePermissionsContext.Provider,{value:{actor_id:'person',role:'developer',grants:[{capability:'repositories:read',project_id:null}]}},createElement(MemberProfilePage,{memberId:'person'}))))
 for(const text of ['Ana Developer','Smart Ticket','Repositorios destacados','team/product','Prioridad alta','Implement OTP','Actividad reciente','3 contribuciones en 2026'])expect(html).toContain(text)
 expect(html).toContain('Agregar foto')
 expect(html).toContain('type="file"')
 expect(html).not.toContain('<dialog')
 expect(html).not.toContain('modal-box')
 expect(html).toContain('href="/team/members"')
})
it('uses recorded counts and includes every day exactly once in leap and common years',()=>{
 for(const year of [2024,2025,2026]){
  const weeks=profileContributionWeeks(year,[{date:`${year}-01-01`,count:7}])
  const days=weeks.flat().filter(day=>day!==null)
  expect(new Set(days.map(day=>day.date)).size).toBe(year===2024?366:365)
  expect(days[0].date).toBe(`${year}-01-01`)
  expect(days.at(-1)?.date).toBe(`${year}-12-31`)
  expect(days.reduce((sum,day)=>sum+day.count,0)).toBe(7)
 }
})
it('rejects malformed chart dates, duplicate days and fabricated priority values',()=>{
 expect(parseMemberProfile(data).contributions).toEqual(data.contributions)
 for(const contributions of [[{date:'2026-02-30',count:1}],[{date:'2025-01-01',count:1}],[{date:'2026-01-01',count:-1}],[...data.contributions,...data.contributions]])expect(()=>parseMemberProfile({...data,contributions})).toThrow()
 expect(()=>parseMemberProfile({...data,priority_tasks:[{...data.priority_tasks[0],priority:'urgent-ish'}]})).toThrow()
})
it('does not retain unexpected private fields in profile metadata',()=>{
 const profile=parseMemberProfile({...data,private_key:'private',member:{...data.member,password_hash:'private'},repositories:[{...data.repositories[0],token:'private'}]})
 expect(JSON.stringify(profile)).not.toContain('private')
})

it('offers a direct profile link from the user menu',()=>{
 const html=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(UserMenu)))
 expect(html).toContain('href="/profile"')
 expect(html).toContain('Mi perfil')
})

it('accepts authored commit activity without confusing it with task or document events',()=>{
 const profile=parseMemberProfile({...data,activity:[{...data.activity[0],kind:'commit',title:'abc123 — Authored change'}]})
 expect(profile.activity[0]?.kind).toBe('commit')
})
