import { requireRecord } from './requireRecord'
import { safeExternalUrl } from './safeExternalUrl'
import type { RepositoryProfileData } from '../types/RepositoryProfileData'
export function parseRepositoryProfile(value:unknown):RepositoryProfileData {
 const v=requireRecord(value),r=requireRecord(v.repository),sync=requireRecord(v.synchronization),counts=requireRecord(v.counts)
 const fail=():never=>{throw Error('El perfil del repositorio recibido no es válido.')}
 const string=(value:unknown):string=>typeof value==='string'?value:fail()
 const nullable=(value:unknown):string|null=>value==null?null:string(value)
 const list=(value:unknown)=>Array.isArray(value)?value.map(requireRecord):fail()
 const number=(value:unknown):number=>typeof value==='number'&&Number.isSafeInteger(value)&&value>=0?value:fail()
 const url=(value:unknown):string|null=>value==null?null:safeExternalUrl(string(value))
 const year=number(v.year)
 if(year<2000||year>9999||v.pull_requests_available!==undefined&&typeof v.pull_requests_available!=='boolean')return fail()
 const seen=new Set<string>()
 const result:RepositoryProfileData={
  repository:{id:nullable(r.id),remote_id:nullable(r.remote_id),name:string(r.name),description:nullable(r.description),provider:nullable(r.provider),status:string(r.status),default_branch:nullable(r.default_branch),web_url:url(r.web_url)},
  projects:list(v.projects).map(p=>({id:string(p.id),name:string(p.name),repository_id:string(p.repository_id)})),
  synchronization:{state:nullable(sync.state),updated_at:nullable(sync.updated_at),last_error:nullable(sync.last_error)},
  counts:{tasks:number(counts.tasks),analyses:number(counts.analyses),pull_requests:number(counts.pull_requests)},
  pull_requests_available:v.pull_requests_available===true,
  pull_requests:list(v.pull_requests).map(pr=>{
   const n=number(pr.number);if(n<1||!['open','closed','merged'].includes(String(pr.state)))return fail()
   return{id:typeof pr.id==='number'?String(number(pr.id)):string(pr.id),number:n,title:string(pr.title),state:string(pr.state),url:url(pr.url)}
  }),
  priority_tasks:list(v.priority_tasks).map(task=>{
   if(task.priority!=='high'&&task.priority!=='critical')return fail()
   return {id:string(task.id),project_id:string(task.project_id),title:string(task.title),priority:task.priority}
  }),
  contributions:list(v.contributions).map(day=>{
   const date=string(day.date)
   if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!date.startsWith(`${year}-`)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||seen.has(date))return fail()
   seen.add(date);return {date,count:number(day.count)}
  }),
  activity:list(v.activity).map(event=>{
   if(event.kind!=='task'&&event.kind!=='document'&&event.kind!=='commit')return fail()
   return{id:string(event.id),project_id:string(event.project_id),kind:event.kind,title:string(event.title),created_at:string(event.created_at),repository_name:nullable(event.repository_name),repository_id:nullable(event.repository_id),commit_sha:nullable(event.commit_sha),branches:event.branches==null?[]:Array.isArray(event.branches)?event.branches.map(string):fail()}
  }),year,
 }
 const projects=new Set(result.projects.map(project=>project.id))
 if(result.priority_tasks.some(task=>!projects.has(task.project_id))||result.activity.some(event=>!projects.has(event.project_id)))return fail()
 return result
}
