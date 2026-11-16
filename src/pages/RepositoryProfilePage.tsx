import ProfileActivityFeed from '../components/ProfileActivityFeed'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'
import { ArrowLeft, GitBranch, GitPullRequest, Link2, ListTodo, RefreshCw } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { parseRepositoryProfile } from '../utils/parseRepositoryProfile'
import { repositorySyncLabel } from '../utils/repositorySyncLabel'
import type { RepositoryProfilePageProps } from '../types/RepositoryProfilePageProps'
import RowAction from '../components/RowAction'
import IconButton from '../components/IconButton'
import DataMessage from '../components/DataMessage'
import Dropdown from '../components/Dropdown'
import ProfileContributions from '../components/ProfileContributions'
import RepositorySyncAction from '../components/RepositorySyncAction'
import RepositoryAnalysisProfile from '../components/RepositoryAnalysisProfile'
import RepositoryBranchProtection from '../components/RepositoryBranchProtection'
import LinkRepositoryModal from '../components/LinkRepositoryModal'
export default function RepositoryProfilePage({projectId,repositoryId,connectionId,remoteId}:RepositoryProfilePageProps) {
 const {t,dateLocale}=useTranslation()
 const [params,setParams]=useSearchParams()
 const [currentYear]=useState(()=>new Date().getUTCFullYear())
 const requested=Number(params.get('year'))
 const year=Number.isInteger(requested)&&requested>=2000&&requested<=currentYear?requested:currentYear
 const fullName=params.get('full_name')??''
 const [linkOpen,setLinkOpen]=useState(false)
 const path=projectId&&repositoryId?`/api/v1/projects/${encodeURIComponent(projectId)}/repositories/${encodeURIComponent(repositoryId)}/profile?year=${year}`:connectionId&&remoteId&&fullName?`/api/v1/git/connections/${encodeURIComponent(connectionId)}/repositories/${encodeURIComponent(remoteId)}/profile?${new URLSearchParams({full_name:fullName,year:String(year)})}`:null
 const profile=useApiData(path,parseRepositoryProfile)
 const data=profile.data
 const years=Array.from({length:Math.min(5,currentYear-1999)},(_,index)=>currentYear-index)
 if(!years.includes(year))years.push(year)
 const projectName=(id:string)=>data?.projects.find(project=>project.id===id)?.name??''
 const repo=data?.repository
 return <section className="flex min-w-0 flex-1 flex-col" aria-label={t('Perfil del repositorio')}>
  <header className="mb-7 flex items-center justify-between gap-3"><div className="flex items-center gap-2"><RowAction label={t(projectId?'Volver al proyecto':'Volver a repositorios')} to={projectId?`/projects/${encodeURIComponent(projectId)}`:'/code'}><ArrowLeft size={16}/></RowAction><span className="text-xs text-base-content/45">{t('Repositorio')}</span></div><div className="flex gap-2">{connectionId&&repo&&(repo.provider==='github'||repo.provider==='gitlab')&&<IconButton label={t('Vincular repositorio')} onClick={()=>setLinkOpen(true)}><Link2 size={16}/></IconButton>}<IconButton label={t('Actualizar repositorio')} disabled={profile.loading} onClick={profile.reload}><RefreshCw size={16}/></IconButton></div></header>
  {data&&profile.error&&<p role="alert" className="mb-4 text-sm text-error">{t(profile.error)}</p>}
  {!path?<DataMessage message={t('Abre el repositorio desde el catálogo para consultar su perfil.')}/>:!data?<DataMessage loading={profile.loading} error={t(profile.error)} onRetry={profile.reload}/>:data&&repo?<div className="grid min-w-0 gap-10 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
   <aside className="min-w-0"><span aria-hidden="true" className="mb-5 flex size-28 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10 text-primary"><GitBranch size={44}/></span><h1 className="break-words text-2xl font-semibold tracking-tight">{repo.name}</h1>{repo.description&&<p className="mt-4 whitespace-pre-wrap break-words text-sm leading-relaxed text-base-content/60">{repo.description}</p>}<div className="mt-4 flex flex-wrap items-center gap-2"><span className="rounded-lg bg-base-200 px-2 py-1 text-xs">{repo.provider??t('Código registrado')}</span>{repo.web_url&&<RowAction href={repo.web_url} label={t('Abrir en el proveedor')}><GitBranch size={15}/></RowAction>}</div>{repo.default_branch&&<dl className="mt-5 text-sm"><dt className="text-xs text-base-content/45">{t('Rama predeterminada')}</dt><dd className="mt-1 break-words font-mono text-base-content/75">{repo.default_branch}</dd></dl>}
    <section className="mt-6 border-t border-base-300 pt-5"><h2 className="mb-3 text-sm font-semibold">{t('Proyectos vinculados')}</h2>{data.projects.length?<ul className="space-y-2 text-sm">{data.projects.map(project=><li key={project.id}><Link className="break-words text-base-content/65 hover:underline" to={`/projects/${encodeURIComponent(project.id)}`}>{project.name}</Link></li>)}</ul>:<p className="text-xs leading-relaxed text-base-content/45">{t('No hay proyectos vinculados que puedas consultar.')}</p>}</section>
    <section className="mt-6 border-t border-base-300 pt-5"><h2 className="mb-3 text-sm font-semibold">{t('Sincronización')}</h2><p className="text-sm text-base-content/65">{t(repositorySyncLabel(data.synchronization.state))}</p>{data.synchronization.updated_at&&<time dateTime={data.synchronization.updated_at} className="mt-2 block text-xs text-base-content/45">{new Date(data.synchronization.updated_at).toLocaleString(dateLocale)}</time>}{data.synchronization.last_error&&<p className="mt-2 text-xs text-error">{t('La última sincronización no pudo completarse.')}</p>}{(repo.provider==='github'||repo.provider==='gitlab')&&<RepositorySyncAction projects={data.projects} state={data.synchronization.state} onComplete={profile.reload}/>}</section>
   </aside>
   <div className="min-w-0 space-y-9">
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">{[[t('Tareas vinculadas'),data.counts.tasks],[t('Análisis'),data.counts.analyses],...(data.pull_requests_available?[[t('PR recientes'),data.counts.pull_requests]]:[])].map(([label,value])=><div key={label} className="rounded-2xl border border-base-300 p-4"><dt className="text-xs text-base-content/50">{label}</dt><dd className="mt-2 text-2xl font-semibold tabular-nums">{value}</dd></div>)}</dl>
    <section aria-labelledby="repository-pulls-title"><h2 id="repository-pulls-title" className="mb-4 flex items-center gap-2 font-semibold"><GitPullRequest size={17}/>{t('Pull Requests recientes')}</h2>{!data.pull_requests_available?<p className="text-sm leading-relaxed text-base-content/45">{t('Las Pull Requests no están disponibles con la conexión actual.')}</p>:data.pull_requests.length?<ul className="divide-y divide-base-300">{data.pull_requests.map(pr=><li key={pr.id} className="flex items-start gap-3 py-4"><GitPullRequest size={16} className="mt-1 shrink-0 text-base-content/45"/><div className="min-w-0 flex-1"><h3 className="break-words text-sm font-medium">{pr.title}</h3><p className="mt-1 text-xs text-base-content/45">#{pr.number} · {t(pr.state==='merged'?'Integrada':pr.state==='closed'?'Cerrada':'Abierta')}</p></div>{pr.url&&<RowAction href={pr.url} label={t('Abrir PR en el proveedor')}><GitBranch size={15}/></RowAction>}</li>)}</ul>:<p className="rounded-2xl border border-dashed border-base-300 p-5 text-sm text-base-content/45">{t('No hay Pull Requests recientes para mostrar.')}</p>}</section>
    <section aria-labelledby="repository-priority-title"><h2 id="repository-priority-title" className="mb-3 font-semibold">{t('Prioridad alta')}</h2>{data.priority_tasks.length?<ul className="divide-y divide-base-300">{data.priority_tasks.map(task=><li key={task.id} className="flex items-start gap-3 py-4"><ListTodo size={17} className="mt-0.5 shrink-0 text-warning"/><div className="min-w-0 flex-1"><h3 className="break-words text-sm font-medium">{task.title}</h3><p className="mt-1 text-xs text-base-content/45">{projectName(task.project_id)}</p></div><span className="text-xs text-warning">{t(task.priority==='critical'?'Crítica':'Alta')}</span></li>)}</ul>:<p className="text-sm text-base-content/45">{t('No hay tareas de prioridad alta vinculadas.')}</p>}</section>
    <div><div className="mb-4 ml-auto w-28"><Dropdown label={t('Año de actividad')} value={String(year)} options={years.map(value=>({value:String(value),label:String(value)}))} onChange={value=>{const next=new URLSearchParams(params);next.set('year',value);setParams(next)}}/></div><ProfileContributions year={data.year} contributions={data.contributions}/></div>
    <ProfileActivityFeed key={`${repo.id}:${year}`} events={data.activity} projectName={projectName} commitPath={event=>{const project=data.projects.find(project=>project.id===event.project_id);const sha=event.commit_sha??(event.kind==='commit'&&/^[a-f0-9]{40,64}$/.test(event.title)?event.title:null);return project&&sha?`/code/repositories/${project.id}/${project.repository_id}/commits/${sha}`:undefined}}/>
    {data.projects.length > 0 && (repo.provider === 'github' || repo.provider === 'gitlab') && <RepositoryBranchProtection projects={data.projects} provider={repo.provider}/>}
    {data.projects.length > 0 && <RepositoryAnalysisProfile key={data.projects.map(project => project.repository_id).join(':')} projects={data.projects} onChanged={profile.reload}/>}
   </div>
  </div>:null}
  {linkOpen&&connectionId&&remoteId&&repo&&(repo.provider==='github'||repo.provider==='gitlab')&&<LinkRepositoryModal connectionId={connectionId} repository={{provider:repo.provider,remote_id:remoteId,full_name:repo.name}} onClose={()=>{setLinkOpen(false);profile.reload()}}/>}
 </section>
}
