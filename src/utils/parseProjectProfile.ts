import { requireRecord } from './requireRecord'
import type { MemberRole } from '../types/MemberRole'
import type { ProjectProfileData } from '../types/ProjectProfileData'

export function parseProjectProfile(value: unknown): ProjectProfileData {
  const fail = (): never => { throw Error('El perfil del proyecto recibido no es válido.') }
  const string = (item: unknown): string => typeof item === 'string' ? item : fail()
  const count = (item: unknown): number => typeof item === 'number' && Number.isSafeInteger(item) && item >= 0 ? item : fail()
  const dateTime = (item: unknown): string => {
    const date = string(item)
    return /^\d{4}-\d{2}-\d{2}T/.test(date) && Number.isFinite(Date.parse(date)) ? date : fail()
  }
  const list = (item: unknown) => Array.isArray(item) ? item.map(requireRecord) : fail()
  const v = requireRecord(value)
  const project = requireRecord(v.project)
  const counts = requireRecord(v.counts)
  const id = string(project.id)
  const projectId = (item: unknown): string => string(item) === id ? id : fail()
  const year = v.year
  if (typeof year !== 'number' || !Number.isInteger(year) || year < 2000 || year > 9999 || typeof project.archived !== 'boolean') return fail()
  const dates = new Set<string>()
  return {
    project: { id, name: string(project.name), description: project.description === null ? null : string(project.description), archived: project.archived, revision: count(project.revision), created_at: dateTime(project.created_at) },
    counts: { tasks: count(counts.tasks), documents: count(counts.documents), requirements: count(counts.requirements), features: count(counts.features) },
    repositories: list(v.repositories).map(repository => ({ id: string(repository.id), project_id: projectId(repository.project_id), name: string(repository.name), provider: repository.provider === null ? null : string(repository.provider), status: string(repository.status) })),
    members: list(v.members).map(member => {
      if (member.role !== null && !['developer', 'technical_lead', 'pmo', 'manager', 'super_admin'].includes(string(member.role))) return fail()
      return { id: string(member.id), name: string(member.name), username: string(member.username), role: member.role as MemberRole | null, position: member.position == null ? '' : string(member.position), avatar_revision: count(member.avatar_revision) }
    }),
    priority_tasks: list(v.priority_tasks).map(task => {
      if (task.priority !== 'high' && task.priority !== 'critical') return fail()
      return { id: string(task.id), project_id: projectId(task.project_id), title: string(task.title), priority: task.priority }
    }),
    contributions: list(v.contributions).map(day => {
      const date = string(day.date)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !date.startsWith(`${year}-`) || !Number.isFinite(Date.parse(date)) || new Date(date).toISOString().slice(0, 10) !== date || dates.has(date)) return fail()
      dates.add(date)
      return { date, count: count(day.count) }
    }),
    activity: list(v.activity).map(event => {
      if (event.kind !== 'task' && event.kind !== 'document' && event.kind !== 'commit') return fail()
      const author = event.author == null ? null : requireRecord(event.author)
      return { id: string(event.id), project_id: projectId(event.project_id), kind: event.kind, title: string(event.title), created_at: dateTime(event.created_at), repository_name: event.repository_name == null ? null : string(event.repository_name), repository_id: event.repository_id == null ? null : string(event.repository_id), commit_sha: event.commit_sha == null ? null : string(event.commit_sha), author: author == null ? null : { id: author.id == null ? null : string(author.id), name: string(author.name), position: string(author.position), avatar_revision: count(author.avatar_revision) }, branches: event.branches == null ? [] : Array.isArray(event.branches) ? event.branches.map(string) : fail() }
    }),
    year,
  }
}
