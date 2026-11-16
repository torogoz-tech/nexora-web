import { requireRecord } from './requireRecord'
import type { EffectivePermissions } from '../types/EffectivePermissions'
export function parseEffectivePermissions(value: unknown): EffectivePermissions {
  const v = requireRecord(value)
  if (typeof v.actor_id !== 'string' || ![null, 'user', 'supervisor', 'developer', 'technical_lead', 'pmo', 'manager', 'super_admin'].includes(v.role as string | null) || !Array.isArray(v.grants)) throw Error('Los permisos recibidos no son válidos.')
  return { actor_id: v.actor_id, role: v.role as EffectivePermissions['role'], grants: v.grants.map(value => {
    const grant = requireRecord(value)
    if (typeof grant.capability !== 'string' || (grant.project_id !== null && typeof grant.project_id !== 'string')) throw Error('Los permisos recibidos no son válidos.')
    return { capability: grant.capability, project_id: grant.project_id as string | null }
  }) }
}
