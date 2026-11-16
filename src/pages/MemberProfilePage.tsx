import MemberWorkflowTasks from '../components/MemberWorkflowTasks'
import MemberWorkWeek from '../components/MemberWorkWeek'
import ProfileActivityFeed from '../components/ProfileActivityFeed'
import {useWorkCatalog} from '../hooks/useWorkCatalog'
import {parseCalendarActivities} from '../utils/parseCalendarActivities'
import PersonalRatingFeedback from '../components/PersonalRatingFeedback'
import MemberTotpSettings from '../components/MemberTotpSettings'
import MemberWeeklyRating from '../components/MemberWeeklyRating'
import MemberImportantDates from '../components/MemberImportantDates'
import { parseLaborCalendar } from '../utils/parseLaborCalendar'
import { calendarToday } from '../utils/calendarToday'
import MemberGitAliases from '../components/MemberGitAliases'
import { useContext, useState } from 'react'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft, FolderGit2, FolderKanban, ListTodo, RefreshCw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { parseMemberProfile } from '../utils/parseMemberProfile'
import MemberProfile from '../components/MemberProfile'
import ProfileContributions from '../components/ProfileContributions'
import DataMessage from '../components/DataMessage'
import IconButton from '../components/IconButton'
import RowAction from '../components/RowAction'
import Dropdown from '../components/Dropdown'
export default function MemberProfilePage({memberId}:{memberId?:string}) {
 const {session}=useAuth()
 const permissions=useContext(WorkspacePermissionsContext)
 const {t,dateLocale}=useTranslation()
 const [params,setParams]=useSearchParams()
 const [currentYear]=useState(()=>new Date().getUTCFullYear())
 const requested=Number(params.get('year'))
 const year=Number.isInteger(requested)&&requested>=2000&&requested<=currentYear?requested:currentYear
 const id=memberId??session?.actorId
 const profile=useApiData(id?`/api/v1/members/${encodeURIComponent(id)}/profile?year=${year}`:null,parseMemberProfile)
 const calendar=useApiData('/api/v1/labor-calendar',parseLaborCalendar)
 const today=calendar.data?calendarToday(calendar.data.settings.timezone):null
 const until=today?new Date(Date.parse(`${today}T12:00:00Z`)+60*86400000).toISOString().slice(0,10):null
 const activities=useWorkCatalog(today?`/api/v1/calendar/activities?from=${today}&to=${until}`:null,parseCalendarActivities)
 const refresh=()=>{profile.reload();calendar.reload();activities.reload()}
 const data=profile.data
 const years=Array.from({length:Math.min(5,currentYear-1999)},(_,index)=>currentYear-index)
 if(!years.includes(year))years.push(year)
 const projectName=(projectId:string)=>data?.projects.find(project=>project.id===projectId)?.name??''
 return <section className="flex min-w-0 flex-1 flex-col" aria-label={t('Perfil del usuario')}>
  <header className="mb-7 flex items-center justify-between gap-3"><div className="flex items-center gap-2">{memberId&&<RowAction label={t('Volver a miembros')} to="/team/members"><ArrowLeft size={16}/></RowAction>}<span className="text-xs font-medium text-base-content/45">{t(memberId?'Perfil del miembro':'Mi perfil')}</span></div><IconButton label={t('Actualizar perfil')} disabled={profile.loading} onClick={refresh}><RefreshCw size={16}/></IconButton></header>
  {data&&profile.error&&<p role="alert" className="mb-4 text-sm text-error">{t(profile.error)}</p>}
  {!data?<DataMessage loading={profile.loading} error={t(profile.error)} onRetry={profile.reload}/>:data?<div className="grid min-w-0 gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
   <div><MemberProfile member={data.member} onSaved={profile.reload}/>{permissions?.role==='super_admin'&&<MemberTotpSettings memberId={data.member.id}/>}{(data.member.role==='developer'||data.member.role==='technical_lead')&&(id===session?.actorId||['super_admin','manager','technical_lead'].includes(permissions?.role??''))&&today&&<MemberWeeklyRating memberId={data.member.id} today={today} own={id===session?.actorId}/>}<MemberGitAliases key={data.member.id} memberId={data.member.id}/><section className="mt-6 border-t border-base-300 pt-5"><h2 className="mb-3 flex items-center gap-2 text-sm font-semibold"><FolderKanban size={15}/>{t('Proyectos')}<span className="ml-auto text-xs text-base-content/40">{data.projects.length}</span></h2>{data.projects.length?<ul className="space-y-2 text-sm text-base-content/65">{[...data.projects].sort((a,b)=>a.name.localeCompare(b.name,dateLocale)).map(project=><li key={project.id} className="break-words"><Link to={`/projects/${encodeURIComponent(project.id)}`} className="hover:underline">{project.name}</Link></li>)}</ul>:<p className="text-xs text-base-content/45">{t('Sin proyectos autorizados.')}</p>}</section></div>
   <div className="min-w-0 space-y-9">

    <section aria-labelledby="profile-priority-title"><header className="mb-3 flex justify-between gap-3"><h2 id="profile-priority-title" className="font-semibold">{t('Prioridad alta')}</h2><span className="text-xs text-base-content/45">{data.priority_tasks.length}</span></header>{data.priority_tasks.length?<ul className="divide-y divide-base-300">{data.priority_tasks.map(task=><li key={task.id} className="flex items-start gap-3 py-4"><span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning"><ListTodo size={16}/></span><div className="min-w-0 flex-1"><h3 className="break-words text-sm font-medium">{task.title}</h3><p className="mt-1 text-xs text-base-content/45">{projectName(task.project_id)}</p></div><span className="text-xs text-warning">{t(task.priority==='critical'?'Crítica':'Alta')}</span></li>)}</ul>:<p className="rounded-2xl border border-dashed border-base-300 px-5 py-6 text-sm text-base-content/45">{t('No hay tareas de prioridad alta pendientes.')}</p>}</section>
    <MemberWorkflowTasks tasks={data.workflow_tasks??[]}/>
    {(data.member.role==='developer'||data.member.role==='technical_lead')&&today&&<MemberWorkWeek key={data.member.id} memberId={data.member.id} today={today}/>}
    {activities.error&&<p role="alert" className="text-sm text-error">{t(activities.error)}</p>}
    {calendar.data&&today?<MemberImportantDates memberId={data.member.id} calendar={calendar.data} today={today} activities={activities.items}/>:calendar.error?<p role="alert" className="text-sm text-error">{t(calendar.error)}</p>:null}
    {!['manager','super_admin'].includes(data.member.role??'')&&<div><div className="mb-4 ml-auto w-28"><Dropdown label={t('Año de actividad')} value={String(year)} options={years.map(value=>({value:String(value),label:String(value)}))} onChange={value=>setParams({year:value})}/></div><ProfileContributions year={data.year} contributions={data.contributions}/></div>}
    {(data.member.role==='developer'||data.member.role==='technical_lead')&&id&&id===session?.actorId&&<PersonalRatingFeedback year={year}/>}
    <ProfileActivityFeed key={`${id}:${year}`} events={data.activity} projectName={projectName} commitPath={event=>event.kind==='commit'&&event.commit_sha&&event.repository_id?`/code/repositories/${event.project_id}/${event.repository_id}/commits/${event.commit_sha}`:undefined}/>
    <section aria-labelledby="profile-repositories-title"><header className="mb-4 flex justify-between gap-3"><h2 id="profile-repositories-title" className="font-semibold">{t('Repositorios destacados')}</h2><span className="text-xs text-base-content/45">{data.repositories.length}</span></header>{data.repositories.length?<div className="grid gap-3 sm:grid-cols-2">{[...data.repositories].sort((a,b)=>a.name.localeCompare(b.name,dateLocale)).map(repository=><article key={repository.id} className="flex min-w-0 flex-col rounded-2xl border border-base-300 bg-base-200/25 p-4"><div className="flex items-start gap-2"><FolderGit2 size={17} className="mt-0.5 shrink-0 text-primary"/><h3 className="min-w-0 break-all text-sm font-semibold"><Link className="hover:underline" to={`/code/repositories/${encodeURIComponent(repository.project_id)}/${encodeURIComponent(repository.id)}`}>{repository.name}</Link></h3></div><p className="mt-3 break-words text-xs text-base-content/50">{projectName(repository.project_id)}</p><footer className="mt-auto flex flex-wrap gap-2 pt-4 text-xs text-base-content/55"><span>{repository.provider??t('Código registrado')}</span><span className="ml-auto rounded-lg bg-base-200 px-2 py-0.5">{t(['active','authorized'].includes(repository.status)?'Autorizado':repository.status==='awaiting_authorization'?'Pendiente de autorización':repository.status==='revoked'?'Revocado':repository.status==='disconnected'?'Desconectado':'Código registrado')}</span></footer></article>)}</div>:<p className="rounded-2xl border border-dashed border-base-300 px-5 py-8 text-center text-sm text-base-content/45">{t('No hay repositorios autorizados para mostrar todavía.')}</p>}</section>
   </div>
  </div>:null}
 </section>
}
