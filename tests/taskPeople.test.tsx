import {describe,it,expect,vi} from 'vitest'
import {renderToStaticMarkup as renderMarkup} from 'react-dom/server'
import {MemoryRouter} from 'react-router'
import type {ReactNode} from 'react'
const renderToStaticMarkup=(element:ReactNode)=>renderMarkup(<MemoryRouter>{element}</MemoryRouter>)
import TaskPeopleMetadata from '../src/components/TaskPeopleMetadata'
import ChangeTaskProjectModal from '../src/components/ChangeTaskProjectModal'
import {parseTaskDetails} from '../src/utils/parseTaskDetails'
vi.mock('../src/hooks/useAuth',()=>({useAuth:()=>({session:{actorId:'creator',displayName:'Ana'}})}))
vi.mock('../src/hooks/useProjects',()=>({useProjects:()=>({projects:[{id:'project',name:'Smart Ticket',archived:false}],status:'ready',hasMore:false})}))
vi.mock('../src/hooks/useIntegrationMutation',()=>({useIntegrationMutation:()=>({busy:false,error:null})}))
const task={id:'task',project_id:null,lifecycle:'pending' as const,workflow_id:null,workflow_version_id:null,state_id:null,assignee_id:null,title:'OTP',context:'',created_by:'creator',revision:1,creator:{id:'creator',name:'Ana',position:'DevOps',avatar_revision:0}}
describe('task people and project',()=>{
 it('shows creator and assignee together only when their stable IDs match',()=>{
  const html=renderToStaticMarkup(<dl><TaskPeopleMetadata task={{...task,assignee_id:'creator'}}/></dl>)
  expect(html).toContain('Creador y responsable')
  expect(html.match(/class="avatar"/g)).toHaveLength(1)
  expect(html).not.toContain('Creada por')
 })
 it('shows separate identities and avatars when names match but IDs differ',()=>{
  const html=renderToStaticMarkup(<dl><TaskPeopleMetadata task={{...task,assignee_id:'other',assignee:{id:'other',name:'Ana',position:'QA',avatar_revision:0}}}/></dl>)
  expect(html).toContain('Creada por');expect(html).toContain('Responsable');expect(html).toContain('QA');expect(html).toContain('DevOps');expect(html.match(/class="avatar"/g)).toHaveLength(2)
 })
 it('does not invent an assignee when the task is unreserved',()=>{
  const html=renderToStaticMarkup(<dl><TaskPeopleMetadata task={task}/></dl>)
  expect(html).toContain('Sin responsable');expect(html.match(/class="avatar"/g)).toHaveLength(1)
 })
 it('provides explicit projectless selection and warns about team visibility with header actions',()=>{
  const html=renderToStaticMarkup(<ChangeTaskProjectModal task={task} onClose={()=>{}} onChanged={()=>{}}/>)
  expect(html).toContain('Proyecto de la tarea');expect(html).toContain('Sin proyecto');expect(html).toContain('visible para todo el equipo');expect(html.indexOf('Guardar cambios')).toBeLessThan(html.indexOf('Proyecto de la tarea'));expect(html).not.toContain('<footer')
 })
 it('accepts the optional enriched assignee from the API',()=>{
  expect(parseTaskDetails({...task,assignee_id:'creator',assignee:task.creator}).assignee?.position).toBe('DevOps')
 })
})
