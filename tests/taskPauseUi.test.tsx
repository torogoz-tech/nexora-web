import {expect,it} from 'vitest'
import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {MemoryRouter} from 'react-router'
import {taskPoolActions} from '../src/utils/taskPoolActions'
import {parseTaskLifecycle} from '../src/utils/parseTaskLifecycle'
import {parseMemberWorkWeek} from '../src/utils/parseMemberWorkWeek'
import MemberWorkflowTasks from '../src/components/MemberWorkflowTasks'
const task={id:'task',project_id:null,project_name:null,title:'Task',assignee_id:'me',workflow_version_id:'version',state_id:'doing',priority:'medium' as const,blocked:false,revision:2,created_by:'other'}
it('managers pause and archive others; resume remains personal',()=>{
 expect(taskPoolActions({...task,lifecycle:'active'},'me','developer')).toMatchObject({pause:true,resume:false,archive:false})
 expect(taskPoolActions({...task,lifecycle:'paused'},'me','developer')).toMatchObject({pause:false,resume:true,transition:false})
 expect(taskPoolActions({...task,lifecycle:'paused'},'other','manager')).toMatchObject({pause:false,resume:false,archive:true})
 for(const role of ['technical_lead','pmo','manager','super_admin'] as const)expect(taskPoolActions({...task,lifecycle:'pending'},'other',role).archive).toBe(true)
 expect(taskPoolActions({...task,lifecycle:'pending'},'me','developer').archive).toBe(false)
 expect(taskPoolActions({...task,lifecycle:'active'},'other','manager')).toMatchObject({pause:true,archive:true})
 expect(taskPoolActions({...task,lifecycle:'active'},'other','technical_lead')).toMatchObject({pause:false,archive:false})
 expect(parseTaskLifecycle('paused')).toBe('paused')
})
it('renders projectless active task cards with a link to task detail',()=>{
 const html=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(MemberWorkflowTasks,{tasks:[{id:'task',project_id:null,title:'Current task',workflow:'Development',state:'In progress',priority:'medium',color:'#123456'}]})))
 expect(html).toContain('Current task');expect(html).toContain('href="/tasks/task"');expect(html).toContain('In progress')
})
it('validates all seven working days including unapproved time',()=>{
 const days=Array.from({length:7},(_,i)=>({date:`2026-11-${String(i+9).padStart(2,'0')}`,active_seconds:3600,regular_seconds:1800,overtime_seconds:1800,unapproved_seconds:0}))
 expect(parseMemberWorkWeek({timezone:'America/El_Salvador',days}).days).toHaveLength(7)
 expect(()=>parseMemberWorkWeek({timezone:'UTC',days:days.slice(1)})).toThrow()
 expect(()=>parseMemberWorkWeek({timezone:'UTC',days:days.map(d=>({...d,active_seconds:-1}))})).toThrow()
})
