import type { MemberRoleAssignment } from '../types/MemberRoleAssignment'
import { requireRecord } from './requireRecord'
export function parseMemberRoleAssignment(value: unknown): MemberRoleAssignment {
  const data = requireRecord(value)
  if ((data.role !== null && !['user', 'supervisor', 'developer', 'technical_lead', 'pmo', 'manager', 'super_admin'].includes(data.role as string))
    || typeof data.all_projects !== 'boolean'
    || !Array.isArray(data.project_ids)
    || !data.project_ids.every(id => typeof id === 'string')
    || !Number.isSafeInteger(data.revision) || (data.revision as number) < 0)
    throw Error('La configuración del rol recibida no es válida.')
  return { role: data.role, all_projects: data.all_projects, project_ids: data.project_ids, revision: data.revision } as MemberRoleAssignment
}
