import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import LaborCalendarHistory from '../src/components/LaborCalendarHistory'
import LaborCalendarSettings from '../src/components/LaborCalendarSettings'
import type { LaborCalendar } from '../src/types/LaborCalendar'
const data: LaborCalendar = {
 settings: {timezone:'America/El_Salvador',country:'SV',workdays:[1,2,3,4,5],daily_minutes:480,work_start:'08:00',work_end:'17:00',break_minutes:60,starts_on:'2026-11-01',revision:1},
 members:[{id:'ana',name:'Ana',approver_id:null,approver_revision:0},{id:'luis',name:'Luis',approver_id:null,approver_revision:0}],approvers:[],can_manage:true,can_request:false,can_propose_holiday:true,
 holidays:[], requests:[
 {id:'request_ana',actor_id:'ana',actor_name:'Ana',kind:'vacation',start_date:'2026-12-01',end_date:'2026-12-03',minutes_per_day:null,reason:'Ana private request',status:'pending',decision_reason:null,can_decide:true},
 {id:'request_luis',actor_id:'luis',actor_name:'Luis',kind:'leave',start_date:'2026-12-04',end_date:'2026-12-04',minutes_per_day:60,reason:'Luis private request',status:'approved',decision_reason:'Approved',can_decide:false},
 ],
}
it('shows only the selected visible member history and a member picker',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><LaborCalendarHistory data={data} busy={false} initialMemberId="luis" onAction={vi.fn()}/></MemoryRouter>)
 expect(html).toContain('aria-label="Miembro"')
 expect(html).toContain('Luis private request')
 expect(html).not.toContain('Ana private request')
 expect(html).not.toContain('Todo el historial')
 expect(html).not.toContain('<select')
})
it('does not let a URL select an invisible developer or request',()=>{
 const visible={...data,members:[data.members[0]!],requests:[data.requests[0]!]}
 const html=renderToStaticMarkup(<MemoryRouter><LaborCalendarHistory data={visible} busy={false} initialMemberId="hidden" onAction={vi.fn()}/></MemoryRouter>)
 expect(html).toContain('Ana private request')
 expect(html).not.toContain('Luis private request')
 expect(html).not.toContain('data-value="hidden"')
})
it('settings link to separate history and explain manager and technical-lead fallback',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><LaborCalendarSettings data={data} busy={false} onSave={vi.fn()}/></MemoryRouter>)
 expect(html).toContain('cualquier gerente o líder técnico')
 expect(html).not.toContain('Ana private request')
})
