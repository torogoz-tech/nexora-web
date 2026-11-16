import {createElement} from 'react'
import {renderToStaticMarkup} from 'react-dom/server'
import {MemoryRouter} from 'react-router'
import {expect,it} from 'vitest'
import MemberImportantDates from '../src/components/MemberImportantDates'
import type {LaborCalendar} from '../src/types/LaborCalendar'
it('shows an upcoming calendar card with date and time, linking to details without actions',()=>{
 const calendar={settings:{timezone:'America/El_Salvador'},holidays:[],requests:[],members:[],approvers:[]} as unknown as LaborCalendar
 const activity={id:'event-1',created_by:'a',creator_name:'Ana',title:'Equipo',description:'',location:'Oficina',start_date:'2026-11-13',end_date:'2026-11-13',all_day:false,start_time:'13:30',end_time:'17:00',revision:1,can_edit:true}
 const html=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(MemberImportantDates,{memberId:'a',calendar,today:'2026-11-09',activities:[activity]})))
 expect(html).toContain('xl:grid-cols-6')
 expect(html).toContain('dateTime="2026-11-13"')
 expect(html).toContain('13:30 – 17:00')
 expect(html).toContain('href="/calendar/activities/event-1"')
 expect(html).not.toContain('<button')
})
