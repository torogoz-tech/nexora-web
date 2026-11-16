import { isCalendarDate } from './isCalendarDate'
export function laborRequestInput(form: FormData) {
  const kind = String(form.get('kind'))
  const start_date = String(form.get('start_date') || '')
  const end_date = String(form.get('end_date') || '')
  const reason = String(form.get('reason') || '').trim()
  const minutes_per_day = kind === 'leave' && form.get('duration') === 'hours' ? Number(form.get('hours')) * 60 : null
  if (!['vacation', 'leave'].includes(kind) || !isCalendarDate(start_date) || !isCalendarDate(end_date) || end_date < start_date || (kind === 'leave' && !reason) || (minutes_per_day !== null && (!Number.isInteger(minutes_per_day) || minutes_per_day <= 0 || minutes_per_day > 1440))) throw Error('Revisa las fechas, la duración y el motivo.')
  return { kind, start_date, end_date, minutes_per_day, reason }
}
