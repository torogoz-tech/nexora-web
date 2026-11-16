import {expect,it} from 'vitest'
import {getMemberImportantDates} from './getMemberImportantDates'
import type {LaborCalendar} from '../types/LaborCalendar'
import type {CalendarActivity} from '../types/CalendarActivity'
it('includes ongoing and upcoming team activities for every member, excluding past activities',()=>{
 const calendar={settings:{country:'SV'},requests:[],holidays:[]} as unknown as LaborCalendar
 const activity=(id:string,start_date:string,end_date:string):CalendarActivity=>({id,start_date,end_date,title:id,created_by:'manager',creator_name:'Manager',description:'',location:'',all_day:true,start_time:null,end_time:null,revision:1,can_edit:false})
 const result=getMemberImportantDates(calendar,'developer','2026-11-09',[activity('past','2026-11-01','2026-11-02'),activity('future','2026-11-13','2026-11-13'),activity('ongoing','2026-11-08','2026-11-10')])
 expect(result.map(date=>date.id)).toEqual(['ongoing','future'])
 expect(result.every(date=>date.kind==='activity')).toBe(true)
})
