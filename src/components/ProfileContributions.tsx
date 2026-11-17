import { useTranslation } from '../hooks/useTranslation'
import { profileContributionWeeks } from '../utils/profileContributionWeeks'
import type { ProfileContribution } from '../types/ProfileContribution'
import type { LaborCalendar } from '../types/LaborCalendar'
import type { CalendarActivity } from '../types/CalendarActivity'
export default function ProfileContributions({year,contributions,memberId='',calendar=null,activities=[]}:{year:number;contributions:ProfileContribution[];memberId?:string;calendar?:LaborCalendar|null;activities?:CalendarActivity[]}) {
 const {t,dateLocale} = useTranslation()
 const weeks = profileContributionWeeks(year,contributions)
 const maximum = Math.max(1,...contributions.map(day=>day.count))
 const colors = ['bg-base-content/8','bg-emerald-500/25','bg-emerald-500/45','bg-emerald-500/70','bg-emerald-500']
 const total = contributions.reduce((sum,day)=>sum+day.count,0)
 const markers=(date:string)=>{
  const vacation=calendar?.requests.some(item=>item.actor_id===memberId&&item.status==='approved'&&item.start_date<=date&&item.end_date>=date)
  const holiday=calendar?.holidays.some(item=>item.status==='approved'&&item.date===date)
  const activity=activities.some(item=>item.start_date<=date&&item.end_date>=date)
  return vacation?'bg-info':holiday?'bg-warning':activity?'bg-primary':null
 }
 return <section aria-labelledby="profile-contributions-title">
  <header className="mb-4 flex flex-wrap items-end justify-between gap-2"><h2 id="profile-contributions-title" className="font-semibold">{t('{0} contribuciones en {1}',{'0':String(total),'1':String(year)})}</h2><span className="text-xs text-base-content/45">{t('Actividad de trabajo')}</span></header>
  <div className="overflow-x-auto rounded-2xl border border-base-300 p-4">
   <div className="mb-2 ml-10 grid min-w-[36rem] grid-cols-12 text-[.65rem] text-base-content/45" aria-hidden="true">{Array.from({length:12},(_,month)=><span key={month}>{new Date(Date.UTC(year,month,1)).toLocaleDateString(dateLocale,{month:'short',timeZone:'UTC'})}</span>)}</div>
   <div className="flex min-w-[39rem] gap-2"><div className="relative w-8 shrink-0"><div className="absolute inset-0 grid grid-rows-7 gap-1 text-[.65rem] leading-none text-base-content/55" aria-label={t("Días de la semana")}>{Array.from({length:7},(_,index)=><span key={index} className="flex items-center">{new Date(Date.UTC(2024,0,index+1)).toLocaleDateString(dateLocale,{weekday:"short",timeZone:"UTC"})}</span>)}</div></div><div className="flex min-w-[36rem] flex-1 gap-1" role="list" aria-label={t('Actividad de trabajo por día')}>
    {weeks.map((week,index)=><div key={index} className="grid min-w-0 flex-1 grid-rows-7 gap-1">{week.map((entry,offset)=>entry?<span key={entry.date} role="listitem" aria-label={t('{0}: {1} contribuciones',{'0':new Date(`${entry.date}T00:00:00Z`).toLocaleDateString(dateLocale,{timeZone:'UTC'}),'1':String(entry.count)})} title={`${entry.date}: ${entry.count}`} className={`aspect-square min-h-2 rounded-sm ${markers(entry.date)??colors[entry.count===0?0:Math.min(4,Math.ceil(entry.count/maximum*4))]}`}/>:<span key={offset} className="aspect-square" aria-hidden="true"/>)}</div>)}
   </div></div>
   <footer className="mt-3 flex items-center justify-end gap-1 text-[.65rem] text-base-content/50"><span className="mr-1">{t('Menos')}</span>{colors.map(color=><span key={color} className={`size-2.5 rounded-sm ${color}`} aria-hidden="true"/>)}<span className="ml-1">{t('Más')}</span></footer>
  </div>
  <p className="mt-2 text-xs leading-relaxed text-base-content/45">{t('Cambios en tareas, versiones de documentos, commits y eventos del calendario dentro de los proyectos autorizados.')}</p>
 </section>
}
