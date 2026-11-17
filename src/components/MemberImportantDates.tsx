import {Link} from 'react-router'
import {CalendarDays,Clock3} from 'lucide-react'
import {useTranslation} from '../hooks/useTranslation'
import {getMemberImportantDates} from '../utils/getMemberImportantDates'
import type {MemberImportantDatesProps} from '../types/MemberImportantDatesProps'
export default function MemberImportantDates({memberId,calendar,today,activities=[]}:MemberImportantDatesProps){
 const {t,dateLocale}=useTranslation(),dates=getMemberImportantDates(calendar,memberId,today,activities)
 const date=(day:string)=>new Date(`${day}T12:00:00Z`)
 const format=(day:string)=>date(day).toLocaleDateString(dateLocale,{timeZone:'UTC',month:'short',day:'numeric'})
 return <section aria-labelledby="profile-important-dates"><h2 id="profile-important-dates" className="mb-4 flex items-center gap-2 font-semibold"><CalendarDays size={16}/>{t('Próximas fechas importantes')}</h2>{dates.length?<ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">{dates.map(item=>{
  const accent=item.kind==='activity'?'text-success bg-success/10 border-success/25':item.kind==='holiday'||item.kind==='public_holiday'?'text-warning bg-warning/10 border-warning/25':'text-info bg-info/10 border-info/25'
  const content=<><div className={`border-b px-3 py-2 ${accent}`}><p className="text-xs capitalize opacity-80">{date(item.start).toLocaleDateString(dateLocale,{weekday:'short',month:'short',timeZone:'UTC'})}</p><time dateTime={item.start} className="block text-3xl font-semibold tabular-nums">{date(item.start).getUTCDate()}</time></div><div className="space-y-2 p-3"><p className="line-clamp-2 text-sm font-medium">{item.kind==='vacation'||item.kind==='leave'?t(item.label):item.label}</p>{item.start!==item.end&&<p className="text-xs text-base-content/55">{format(item.start)} — {format(item.end)}</p>}<p className="flex items-start gap-1 text-xs tabular-nums text-base-content/55"><Clock3 size={12} className="mt-0.5 shrink-0"/>{item.kind==='activity'&&!item.allDay&&item.startTime?`${item.startTime}${item.endTime?` – ${item.endTime}`:''}`:t('Todo el día')}</p></div></>
  return <li key={item.id} className="min-w-0 overflow-hidden rounded-xl border border-base-300 bg-base-200/15"><Link className="block h-full transition-colors hover:bg-base-200/50 focus-visible:outline-2 focus-visible:outline-primary" to={item.kind==='activity'?`/calendar/activities/${item.id}`:`/calendar?date=${encodeURIComponent(item.start)}`}>{content}</Link></li>
 })}</ul>:<p className="text-sm text-base-content/45">{t('No hay fechas importantes próximas.')}</p>}</section>
}
