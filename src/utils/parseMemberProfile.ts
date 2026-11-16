import { requireRecord } from './requireRecord'
import { parseOrganizationMembers } from './parseOrganizationMembers'
import type { MemberProfileData } from '../types/MemberProfileData'
export function parseMemberProfile(value: unknown): MemberProfileData {
 const v = requireRecord(value)
 const fail = (): never => { throw Error('El perfil recibido no es válido.') }
 const string = (value: unknown): string => typeof value === 'string' ? value : fail()
 const list = (value: unknown) => Array.isArray(value) ? value.map(requireRecord) : fail()
 const year = v.year
 if (typeof year !== 'number' || !Number.isInteger(year) || year < 2000 || year > 9999) return fail()
 const dates = new Set<string>()
 return {
  member: parseOrganizationMembers([v.member])[0]!, year,
  projects: list(v.projects).map(p => ({ id: string(p.id), name: string(p.name) })),
  repositories: list(v.repositories).map(r => ({ id: string(r.id), project_id: string(r.project_id), name: string(r.name), provider: r.provider == null ? null : string(r.provider), status: string(r.status) })),
  priority_tasks: list(v.priority_tasks).map(task => {
   if (task.priority !== 'high' && task.priority !== 'critical') return fail()
   return { id: string(task.id), project_id: string(task.project_id), title: string(task.title), priority: task.priority }
  }),
  workflow_tasks: list(v.workflow_tasks ?? []).map(task=>({id:string(task.id),project_id:task.project_id==null?null:string(task.project_id),title:string(task.title),state:string(task.state),workflow:string(task.workflow),color:task.color==null?null:string(task.color),priority:string(task.priority)})),
  contributions: list(v.contributions).map(day => {
   const date = string(day.date)
   if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !date.startsWith(`${year}-`) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0,10)!==date || dates.has(date) || typeof day.count !== 'number' || !Number.isSafeInteger(day.count) || day.count < 0) return fail()
   dates.add(date)
   return { date, count: day.count }
  }),
  activity: list(v.activity).map(event => {
   if (event.kind !== 'task' && event.kind !== 'document' && event.kind !== 'commit') return fail()
   return { id: string(event.id), project_id: string(event.project_id), title: string(event.title), kind: event.kind, created_at: string(event.created_at), repository_name: event.repository_name == null ? null : string(event.repository_name), repository_id: event.repository_id == null ? null : string(event.repository_id), commit_sha: event.commit_sha == null ? null : string(event.commit_sha), branches: event.branches == null ? [] : Array.isArray(event.branches) ? event.branches.map(string) : fail() }
  }),
 }
}
