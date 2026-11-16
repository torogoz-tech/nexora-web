import type {CalendarActivity} from '../types/CalendarActivity'
export function calendarActivityLayout(activities:CalendarActivity[],date:string){
 const minute=(time:string|null)=>Number(time?.slice(0,2)??0)*60+Number(time?.slice(3,5)??0)
 const lanes:number[]=[]
 const entries=activities.filter(a=>!a.all_day&&a.start_date<=date&&a.end_date>=date).map(activity=>({activity,start:activity.start_date===date?minute(activity.start_time):0,end:activity.end_date===date?minute(activity.end_time):1440})).sort((a,b)=>a.start-b.start||a.end-b.end||a.activity.id.localeCompare(b.activity.id))
 return entries.map(entry=>{let lane=lanes.findIndex(end=>end<=entry.start);if(lane<0)lane=lanes.length;lanes[lane]=entry.end;return {...entry,lane}}).map(entry=>({...entry,lanes:lanes.length}))
}
