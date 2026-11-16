import { requireRecord } from './requireRecord'
import type { OrganizationTimezone } from '../types/OrganizationTimezone'
export function parseOrganizationTimezone(value: unknown): OrganizationTimezone {
  const v = requireRecord(value)
  if (typeof v.timezone !== 'string' || !v.timezone || typeof v.revision !== 'number' || !Number.isSafeInteger(v.revision) || v.revision < 1) throw Error('La zona horaria recibida no es válida.')
  try { new Intl.DateTimeFormat('en', { timeZone: v.timezone }) } catch { throw Error('La zona horaria recibida no es válida.') }
  return { timezone: v.timezone, revision: v.revision }
}
