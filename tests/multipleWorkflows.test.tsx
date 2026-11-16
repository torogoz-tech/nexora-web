// @vitest-environment jsdom
import {afterEach,expect,it,vi} from 'vitest'
import {cleanup,fireEvent,render,waitFor} from '@testing-library/react'
import TakeTaskWorkflowModal from '../src/components/TakeTaskWorkflowModal'
import MemberWorkflowModal from '../src/components/MemberWorkflowModal'
import type {OrganizationMember} from '../src/types/OrganizationMember'
import type {DeveloperBoardTask} from '../src/types/DeveloperBoardTask'
const mocks=vi.hoisted(()=>({take:vi.fn().mockResolvedValue(undefined),assign:vi.fn().mockResolvedValue(undefined),memberships:[{workflow_id:'dev',workflow_version_id:'v1',revision:1},{workflow_id:'qa',workflow_version_id:'v2',revision:2}]}))
vi.mock('../src/components/IntegrationDialog',()=>({default:({children}:{children:React.ReactNode})=><div>{children}</div>}))
vi.mock('../src/components/Dropdown',()=>({default:({label,value,onChange,options,placeholder}:{label:string;value:string;onChange:(v:string)=>void;options:{value:string;label:string}[];placeholder?:string})=><select aria-label={label} value={value} onChange={event=>onChange(event.target.value)}>{placeholder&&<option value="">{placeholder}</option>}{options.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}</select>}))
vi.mock('../src/hooks/useApiData',()=>({useApiData:(path:string|null)=>({data:path?.includes('/repositories')?{items:[{id:'api',remote_full_name:'org/api',authorization_status:'authorized',archived:false},{id:'web',remote_full_name:'org/web',authorization_status:'authorized',archived:false}],next_cursor:null}:mocks.memberships,loading:false,error:null,reload:vi.fn()})}))
vi.mock('../src/hooks/useWorkCatalog',()=>({useWorkCatalog:()=>({items:[{id:'dev',name:'Desarrollo',latest_version_id:'v1'},{id:'qa',name:'QA',latest_version_id:'v2'},{id:'design',name:'Diseño',latest_version_id:'v3'}],loading:false,error:null,reload:vi.fn()})}))
vi.mock('../src/services/mutatePoolTask',()=>({mutatePoolTask:mocks.take}))
vi.mock('../src/services/assignDeveloperWorkflow',()=>({assignDeveloperWorkflow:mocks.assign}))
afterEach(()=>{cleanup();vi.clearAllMocks()})
it('starts the workflow selected on the task without allowing a different assignee choice',async()=>{
 const done=vi.fn(),task={id:'t',revision:7,purpose:'implementation',entry_workflow_id:'qa'} as DeveloperBoardTask
 const view=render(<TakeTaskWorkflowModal task={task} actorId="lead" onClose={()=>{}} onChanged={done}/>)
 expect(view.queryByRole('combobox')).toBeNull()
 expect((view.getByRole('button',{name:'Tomar tarea'}) as HTMLButtonElement).disabled).toBe(false)
 fireEvent.click(view.getByRole('button',{name:'Tomar tarea'}))
 await waitFor(()=>expect(done).toHaveBeenCalledOnce())
 expect(mocks.take.mock.calls[0][0]).toBe(task)
 expect(mocks.take.mock.calls[0][6]).toBeUndefined()
})
it('adds a separate membership without using another workflows revision',async()=>{
 const done=vi.fn()
 const view=render(<MemberWorkflowModal member={{id:'lead',name:'Lead',role:'technical_lead'} as OrganizationMember} onClose={()=>{}} onSaved={done}/>)
 expect(view.getAllByText('Desarrollo').length).toBe(2)
 fireEvent.change(view.getByRole('combobox'),{target:{value:'v3'}})
 fireEvent.click(view.getByRole('button',{name:'Guardar cambios'}))
 await waitFor(()=>expect(done).toHaveBeenCalledOnce())
 expect(mocks.assign.mock.calls[0].slice(0,3)).toEqual(['lead','v3',0])
})

it('requires explicit implementation repositories and sends only selected branches for preparation',async()=>{
 const done=vi.fn(),task={id:'t',revision:8,purpose:'implementation',entry_workflow_id:'dev',project_id:'p'} as DeveloperBoardTask
 const view=render(<TakeTaskWorkflowModal task={task} actorId="dev" onClose={()=>{}} onChanged={done}/>)
 expect((view.getByRole('button',{name:'Tomar tarea'}) as HTMLButtonElement).disabled).toBe(true)
 fireEvent.click(view.getByRole('checkbox',{name:'org/web'}))
 fireEvent.click(view.getByRole('button',{name:'Tomar tarea'}))
 await waitFor(()=>expect(done).toHaveBeenCalledOnce())
 expect(mocks.take.mock.calls[0][7]).toEqual(['web'])
})
