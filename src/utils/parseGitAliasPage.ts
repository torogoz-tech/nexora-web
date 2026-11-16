import { requireRecord } from './requireRecord'
import type { GitAliasPage } from '../types/GitAliasPage'
export function parseGitAliasPage(value: unknown): GitAliasPage {
 const v = requireRecord(value), fail = (): never => { throw Error('El catálogo de alias Git no es válido.') }
 const text = (x: unknown): string => typeof x === 'string' ? x : fail()
 const nullable = (x: unknown): string | null => x === null ? null : text(x)
 if (!Array.isArray(v.items) || typeof v.has_more !== 'boolean' || (v.next_after !== null && typeof v.next_after !== 'string') || (v.has_more && !v.next_after)) return fail()
 return { has_more: v.has_more, next_after: v.next_after as string | null, items: v.items.map(raw => {
  const a = requireRecord(raw)
  if (!['github', 'gitlab'].includes(String(a.provider)) || !Number.isSafeInteger(a.revision) || Number(a.revision) < 1) return fail()
  return { id: text(a.id), actor_id: text(a.actor_id), actor_name: text(a.actor_name), provider: a.provider as 'github' | 'gitlab', host: text(a.host), email: text(a.email), project_id: nullable(a.project_id), revision: Number(a.revision), revoked_at: nullable(a.revoked_at) }
 }) }
}
