// @vitest-environment jsdom
import {cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react'
import {afterEach,expect,it,vi} from 'vitest'
import {apiFetch} from '../services/apiFetch'
import TaskTransitionApproval from '../components/TaskTransitionApproval'
import type {TaskTransitionRun} from '../types/TaskTransitionRun'
vi.mock('../services/apiFetch',()=>({apiFetch:vi.fn()}))
afterEach(()=>{cleanup();vi.resetAllMocks()})
it('approves the exact pinned transition parameters and refreshes only after success',async()=>{
 const parameters={expected_revision:7,branches:[{repository_id:'r',branch_name:'develop',expected_head_sha:'a'.repeat(40)}],resolution:'fixed'}
 const run:TaskTransitionRun={id:'run',task_id:'task',transition_id:'finish',actor_id:'author',parameters,task_revision:7,status:'waiting_approval',next_step:0,advanced:false,outcomes:[]}
 const changed=vi.fn();vi.mocked(apiFetch).mockResolvedValue(new Response('{}'))
 render(<TaskTransitionApproval run={run} onChanged={changed}/>);fireEvent.change(screen.getByLabelText('Motivo de la aprobación'),{target:{value:'Revisado'}});fireEvent.click(screen.getByRole('button',{name:'Aprobar y continuar'}))
 await waitFor(()=>expect(changed).toHaveBeenCalledOnce())
 const [url,options]=vi.mocked(apiFetch).mock.calls[0];expect(url).toBe('/api/v1/tasks/task/approvals');expect(JSON.parse(String(options?.body))).toEqual({transition_id:'finish',parameters,reason:'Revisado',expires_in_seconds:3600})
})
