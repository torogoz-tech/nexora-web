import {expect,it} from 'vitest'
import {calendarActivityLayout} from './calendarActivityLayout'
import type {CalendarActivity} from '../types/CalendarActivity'
const activity=(id:string,start_time:string,end_time:string,dates={start_date:'2026-11-09',end_date:'2026-11-09'}):CalendarActivity=>({id,...dates,start_time,end_time,title:id,created_by:'manager',creator_name:'Manager',description:'',location:'',all_day:false,revision:1,can_edit:false})
it('positions timed activities by minute and gives overlapping activities separate lanes',()=>{
 const result=calendarActivityLayout([activity('later','10:00','11:00'),activity('overlap','09:30','10:30'),activity('first','09:00','10:00')],'2026-11-09')
 expect(result.map(({activity,start,end,lane})=>[activity.id,start,end,lane])).toEqual([['first',540,600,0],['overlap',570,630,1],['later',600,660,0]])
 expect(result.every(entry=>entry.lanes===2)).toBe(true)
})
it('clips multi-day activities to each day and excludes all-day and out-of-period entries',()=>{
 const entries=[activity('overnight','23:00','01:00',{start_date:'2026-11-09',end_date:'2026-11-10'}),{...activity('all-day','00:00','00:00'),all_day:true}]
 expect(calendarActivityLayout(entries,'2026-11-09').map(({start,end})=>[start,end])).toEqual([[1380,1440]])
 expect(calendarActivityLayout(entries,'2026-11-10').map(({start,end})=>[start,end])).toEqual([[0,60]])
 expect(calendarActivityLayout(entries,'2026-11-11')).toEqual([])
})
