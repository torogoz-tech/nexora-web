import { requireRecord } from './requireRecord'
import type { MemberRole } from '../types/MemberRole'
export function parseNavigationRole(value: unknown): MemberRole | null {
  const role = requireRecord(requireRecord(value).member).role
  return typeof role === 'string' && ['user', 'supervisor', 'developer', 'technical_lead', 'pmo', 'manager', 'super_admin'].includes(String(role)) ? role as MemberRole : null
}
