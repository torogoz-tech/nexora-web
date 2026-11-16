import type {CalendarActivity} from '../types/CalendarActivity'
import type { LaborCalendar } from '../types/LaborCalendar'
import type { ProfileImportantDate } from '../types/ProfileImportantDate'
export function getMemberImportantDates(data:LaborCalendar,member:string,today:string,activities:CalendarActivity[]=[]):ProfileImportantDate[]{
 const requests:ProfileImportantDate[]=data.requests.filter(item=>item.actor_id===member&&item.status==='approved'&&item.end_date>=today).map(item=>({id:item.id,label:item.kind==='vacation'?'Vacaciones':'Permiso',start:item.start_date,end:item.end_date,kind:item.kind}))
 const holidays:ProfileImportantDate[]=data.holidays.filter(item=>item.status==='approved'&&item.date>=today&&(!item.country||item.country===data.settings.country)).map(item=>({id:item.id,label:item.name,start:item.date,end:item.date,kind:item.kind??'holiday'}))
 const events:ProfileImportantDate[]=activities.filter(item=>item.end_date>=today).map(item=>({id:item.id,label:item.title,start:item.start_date,end:item.end_date,kind:'activity',allDay:item.all_day,startTime:item.start_time,endTime:item.end_time}))
 return [...requests,...holidays,...events].sort((a,b)=>a.start.localeCompare(b.start)||a.id.localeCompare(b.id)).slice(0,6)
}
