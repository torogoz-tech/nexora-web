import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import { WorkspacePermissionsContext } from '../src/app/WorkspacePermissionsContext'
import MemberProfilePage from '../src/pages/MemberProfilePage'
import TaskTypeEditorPage from '../src/pages/TaskTypeEditorPage'
const fixture = vi.hoisted(()=>({memberId:'self',role:'developer'}))
vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>({session:{actorId:'self'}})}))
vi.mock('../src/hooks/useApiData',()=>({useApiData:(path:string)=>({loading:false,error:null,reload:vi.fn(),data:path.includes('/profile?')?{member:{id:fixture.memberId,role:fixture.role},projects:[],priority_tasks:[],repositories:[],activity:[],contributions:[],year:2026}:null})}))
vi.mock('../src/hooks/useWorkCatalog',()=>({useWorkCatalog:()=>({items:[{code:'bug',name:'Bug',icon:'bug',revision:3}],loading:false,error:null,reload:vi.fn()})}))
vi.mock('../src/components/MemberProfile',()=>({default:()=>createElement('p',null,'Member identity')}))
vi.mock('../src/components/MemberGitAliases',()=>({default:()=>null}))
vi.mock('../src/components/MemberWeeklyRating',()=>({default:()=>createElement('p',null,'Weekly rating')}))
vi.mock('../src/components/MemberImportantDates',()=>({default:()=>null}))
vi.mock('../src/components/DeveloperRatings',()=>({default:()=>createElement('p',null,'Developer ratings')}))
vi.mock('../src/components/ProfileContributions',()=>({default:()=>createElement('p',null,'Contributions')}))
vi.mock('../src/components/TaskTypeForm',()=>({default:()=>createElement('form',{'aria-label':'Task type form'})}))
function render(element:ReturnType<typeof createElement>){return renderToStaticMarkup(createElement(MemoryRouter,null,element))}
it('keeps MCP settings out of the profile and repositories last',()=>{
 fixture.memberId='self';fixture.role='developer'
 const own=render(createElement(MemberProfilePage))
 expect(own).not.toContain('Acceso MCP')
 expect(own.indexOf('Contributions')).toBeLessThan(own.indexOf('Repositorios destacados'))
 fixture.memberId='other'
 expect(render(createElement(MemberProfilePage,{memberId:'other'}))).not.toContain('Personal MCP keys')
})
it('does not rate managers or installation administrators',()=>{
 fixture.memberId='self'
 for(const role of ['manager','pmo','superadmin']){
  fixture.role=role
  expect(render(createElement(MemberProfilePage))).not.toContain('Developer ratings')
 }
 fixture.role='technical_lead'
 const html=render(createElement(MemberProfilePage));expect(html).toContain('Feedback');expect(html).not.toContain('Developer ratings')
})
it('task type editing is a full page with a return link and form, not a dialog',()=>{
 const html=render(createElement(TaskTypeEditorPage,{code:'bug'}))
 expect(html).toContain('Editar tipo de tarea')
 expect(html).toContain('href="/settings/task-types"')
 expect(html).toContain('Task type form')
 expect(html).not.toContain('<dialog')
})

it('never exposes personal feedback while visiting another member profile',()=>{
 fixture.memberId='other';fixture.role='developer'
 for(const role of ['developer','technical_lead','manager','super_admin'] as const){
  const html=render(createElement(WorkspacePermissionsContext.Provider,{value:{actor_id:'self',role,grants:[]}},createElement(MemberProfilePage,{memberId:'other'})))
  expect(html).not.toContain('Feedback')
 }
})

it('omits contribution charts and their year selector for managerial targets regardless of the viewer',()=>{
 fixture.memberId='other'
 for(const role of ['manager','super_admin']) {
  fixture.role=role
  const html=render(createElement(MemberProfilePage,{memberId:'other'}))
  expect(html).not.toContain('Contributions')
  expect(html).not.toContain('Año de actividad')
  expect(html).toContain('Member identity')
 }
 fixture.role='technical_lead'
 expect(render(createElement(MemberProfilePage,{memberId:'other'}))).toContain('Contributions')
 fixture.memberId='self';fixture.role='developer'
})
