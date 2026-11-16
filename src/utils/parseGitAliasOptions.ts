import { requireRecord } from './requireRecord'
import type { GitAliasOptions } from '../types/GitAliasOptions'
export function parseGitAliasOptions(value: unknown): GitAliasOptions {
 const v = requireRecord(value)
 if (!Array.isArray(v.actors) || typeof v.can_manage !== 'boolean' || typeof v.can_manage_global !== 'boolean' || (v.can_manage_global && !v.can_manage)) throw Error('Las opciones de alias Git no son válidas.')
 const actors = v.actors.map(raw => { const a = requireRecord(raw); if (typeof a.id !== 'string' || typeof a.name !== 'string' || !a.id || (a.username != null && typeof a.username !== 'string')) throw Error('Las opciones de alias Git no son válidas.'); return { id: a.id, name: a.name, ...(typeof a.username === 'string' ? { username: a.username } : {}) } })
 return { actors, can_manage: v.can_manage, can_manage_global: v.can_manage_global }
}
