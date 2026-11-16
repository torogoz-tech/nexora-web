import {describe,it,expect,vi,beforeEach} from 'vitest'
import {renderToStaticMarkup as renderMarkup} from 'react-dom/server'
import {MemoryRouter} from 'react-router'
import type {ReactNode} from 'react'
const renderToStaticMarkup=(element:ReactNode)=>renderMarkup(<MemoryRouter>{element}</MemoryRouter>)
import TaskCreatorIdentity from '../src/components/TaskCreatorIdentity'
import TaskMetadataEditor from '../src/components/TaskMetadataEditor'
import TaskTypeBadge from '../src/components/TaskTypeBadge'
const state=vi.hoisted(()=>({profile:null as unknown}))
vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>({session:{actorId:'actor',displayName:'Abner'}})}))
vi.mock('../src/hooks/useIntegrationMutation',()=>({useIntegrationMutation:()=>({busy:false,error:null,run:vi.fn()})}))
vi.mock('../src/hooks/useApiData',()=>({useApiData:(path:string|null)=>({data:path?.includes('/profile')?state.profile:path?{types:[{code:'task',name:'Tarea'},{code:'incident',name:'Incidente'}],assignees:[]}:null,loading:false,error:null,reload:vi.fn()})}))
beforeEach(()=>{state.profile=null})
describe('task metadata',()=>{
 it('resolves the real creator from the existing profile API when the task API lacks presentation metadata',()=>{
  state.profile={member:{name:'Abner Velasco',position:'Líder Técnico',avatar_revision:0}}
  const html=renderToStaticMarkup(<TaskCreatorIdentity actorId="actor"/>)
  expect(html).toContain('Abner Velasco');expect(html).toContain('Líder Técnico');expect(html).not.toContain('>Miembro<');expect(html).not.toContain('>actor<')
 })
 it('uses the signed-in identity while profile metadata is unavailable',()=>{
  expect(renderToStaticMarkup(<TaskCreatorIdentity actorId="actor"/>)).toContain('Abner')
 })
 it('shows the task type even when an older API omits its display name',()=>{
  const html=renderToStaticMarkup(<TaskTypeBadge code="task" projectId={null}/>)
  expect(html).toContain('Tarea');expect(html).toContain('<svg')
 })
 it('edits title, type and priority with actions above the fields',()=>{
  const html=renderToStaticMarkup(<TaskMetadataEditor task={{id:'t',project_id:null,lifecycle:'pending',workflow_id:null,workflow_version_id:null,state_id:null,assignee_id:null,title:'OTP',context:'',created_by:'actor',revision:1,type_code:'task',priority:'medium'}} onClose={()=>{}} onChanged={()=>{}}/>)
  expect(html).toContain('Título de la tarea');expect(html).toContain('Tipo de tarea');expect(html).toContain('Prioridad de la tarea');expect(html).toContain('value="OTP"');expect(html).not.toContain('<footer');expect(html.indexOf('Guardar cambios')).toBeLessThan(html.indexOf('<fieldset'))
 })
})
