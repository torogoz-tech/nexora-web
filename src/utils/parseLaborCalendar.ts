import type { LaborCalendar } from '../types/LaborCalendar'
import { workIntervalMinutes } from './workIntervalMinutes'
import { isCalendarDate } from './isCalendarDate'
export function parseLaborCalendar(value: unknown): LaborCalendar {
  const fail = () => { throw Error('El calendario laboral no es válido.') }
  if (!value || typeof value !== 'object') return fail()
  const data = value as LaborCalendar
  const settings = data.settings
  if (!settings || typeof settings.timezone !== 'string' || (settings.country !== null && typeof settings.country !== 'string') || !Array.isArray(settings.workdays) || settings.workdays.some(day => !Number.isInteger(day) || day < 1 || day > 7) || !Number.isInteger(settings.daily_minutes) || settings.daily_minutes < 1 || settings.daily_minutes > 1440 || !Number.isInteger(settings.revision) || settings.revision < 0 || !isCalendarDate(settings.starts_on) || !Array.isArray(data.holidays) || !Array.isArray(data.requests) || !Array.isArray(data.members) || !Array.isArray(data.approvers) || typeof data.can_manage !== 'boolean') return fail()
  try { new Intl.DateTimeFormat('en', { timeZone: settings.timezone }).format() } catch { return fail() }
  const span = workIntervalMinutes(settings.work_start, settings.work_end, settings.work_end <= settings.work_start)
  if (span === null || !Number.isInteger(settings.break_minutes) || settings.break_minutes < 0 || settings.break_minutes >= span || span - settings.break_minutes !== settings.daily_minutes) return fail()
  const status = (s: unknown) => ['pending', 'approved', 'rejected'].includes(String(s))
  if (data.holidays.some(item => !item || typeof item.id !== 'string' || typeof item.name !== 'string' || (item.kind !== undefined && !['holiday', 'public_holiday'].includes(item.kind)) || !isCalendarDate(item.date) || !status(item.status)) || data.requests.some(item => !item || typeof item.id !== 'string' || typeof item.actor_name !== 'string' || !['vacation', 'leave'].includes(item.kind) || !isCalendarDate(item.start_date) || !isCalendarDate(item.end_date) || item.end_date < item.start_date || !status(item.status) || (item.minutes_per_day !== null && (!Number.isInteger(item.minutes_per_day) || item.minutes_per_day < 1 || item.minutes_per_day > 1440))) || data.members.some(item => !item || typeof item.id !== 'string' || typeof item.name !== 'string' || !Number.isInteger(item.approver_revision) || item.approver_revision < 0) || data.approvers.some(item => !item || typeof item.id !== 'string' || typeof item.name !== 'string')) return fail()
  return { ...data, can_create_activity: data.can_create_activity === true, settings: { ...settings, country: settings.country || '' }, can_propose_holiday: data.can_propose_holiday === true, can_request: data.can_request === true, holidays: data.holidays.map(item => ({ ...item, can_decide: item.can_decide === true })), requests: data.requests.map(item => ({ ...item, can_decide: item.can_decide === true })) }
}
