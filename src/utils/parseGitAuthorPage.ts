import { requireRecord } from './requireRecord'
import type { GitAuthorPage } from '../types/GitAuthorPage'
export function parseGitAuthorPage(value: unknown): GitAuthorPage {
 const v = requireRecord(value), fail = (): never => { throw Error('El registro de autores Git no es válido.') }
 const text = (x: unknown): string => typeof x === 'string' ? x : fail()
 const nullable = (x: unknown): string | null => x === null ? null : text(x)
 if (!Array.isArray(v.items) || typeof v.has_more !== 'boolean' || (v.next_after !== null && typeof v.next_after !== 'string') || (v.has_more && !v.next_after)) return fail()
 return { has_more: v.has_more, next_after: v.next_after as string | null, items: v.items.map(raw => {
  const a = requireRecord(raw)
  if (!['github', 'gitlab'].includes(String(a.provider))) return fail()
  return { id: text(a.id), provider: a.provider as 'github' | 'gitlab', host: text(a.host), project_id: text(a.project_id), repository_id: text(a.repository_id), commit_sha: text(a.commit_sha), author_name: text(a.author_name), author_email: nullable(a.author_email), actor_id: nullable(a.actor_id), actor_name: nullable(a.actor_name), alias_id: nullable(a.alias_id), occurred_at: text(a.occurred_at) }
 }) }
}
