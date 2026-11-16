// @vitest-environment jsdom
import {afterEach,expect,it} from 'vitest'
import {cleanup,render} from '@testing-library/react'
import DataMessage from '../src/components/DataMessage'
import TaskCommentBody from '../src/components/TaskCommentBody'
import {taskPoolActions} from '../src/utils/taskPoolActions'
afterEach(cleanup)
it('does not reserve empty status space when no request message is present',()=>{
 const view=render(<DataMessage loading={false} error=""/>)
 expect(view.container.childElementCount).toBe(0)
 view.rerender(<DataMessage loading={true}/>)
 expect(view.getByRole('status')).toBeTruthy()
})
it('renders Markdown comments without allowing executable HTML',()=>{
 const view=render(<TaskCommentBody body={'**Buen trabajo**\n\n- Evidencia\n\n<script>alert(1)</script>'}/>)
 expect(view.getByText('Buen trabajo').tagName).toBe('STRONG')
 expect(view.getByRole('listitem').textContent).toBe('Evidencia')
 expect(view.container.querySelector('script')).toBeNull()
})
it('allows the assigned technical lead to take a task and never takes another reservation',()=>{
 const task={id:'t',title:'Task',project_id:null,project_name:null,lifecycle:'pending' as const,assignee_id:'diego',workflow_version_id:null,state_id:null,priority:'medium' as const,blocked:false,revision:1}
 expect(taskPoolActions(task,'diego','technical_lead').take).toBe(true)
 expect(taskPoolActions(task,'another','technical_lead').take).toBe(false)
 expect(taskPoolActions(task,'diego','manager').take).toBe(true)
})
