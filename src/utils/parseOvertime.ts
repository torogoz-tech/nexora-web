import type { OvertimeData } from '../types/OvertimeData'
import { parseOvertimeEvidence } from './parseOvertimeEvidence'
import { isCalendarDate } from './isCalendarDate'
import { workIntervalMinutes } from './workIntervalMinutes'
export function parseOvertime(value: unknown): OvertimeData {
  const fail = () => { throw Error('El registro de horas extras no es válido.') }
  if (!value || typeof value !== 'object') return fail()
  const data = value as OvertimeData
  if (!Array.isArray(data.items) || !Number.isSafeInteger(data.total_approved_minutes) || data.total_approved_minutes < 0) return fail()
  if (data.items.some(item => !item || typeof item.id !== 'string' || typeof item.actor_id !== 'string' || typeof item.actor_name !== 'string' || !isCalendarDate(item.date) || typeof item.next_day !== 'boolean' || workIntervalMinutes(item.start_time, item.end_time, item.next_day) !== item.minutes || typeof item.reason !== 'string' || !['pending', 'approved', 'rejected'].includes(item.status) || (item.decision_reason !== null && typeof item.decision_reason !== 'string') || (item.decided_by_name !== null && typeof item.decided_by_name !== 'string') || (item.decided_at !== null && (typeof item.decided_at !== 'string' || Number.isNaN(Date.parse(item.decided_at)))) || typeof item.created_at !== 'string' || Number.isNaN(Date.parse(item.created_at)))) return fail()
  return { ...data, can_request: data.can_request === true, can_manage: data.can_manage === true, items: data.items.map(item => ({ ...item, ...parseOvertimeEvidence(item), can_attach_evidence: item.can_attach_evidence === true && item.status !== 'rejected', can_decide: item.can_decide === true && item.status === 'pending' })) }
}
