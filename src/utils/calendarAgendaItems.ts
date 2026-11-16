import type { LaborCalendar } from '../types/LaborCalendar'
export function calendarAgendaItems(data: LaborCalendar, day: string | null, tab: string, status: string) {
  return [...(tab === 'holidays' ? [] : data.requests), ...(tab === 'requests' ? [] : data.holidays)]
    .filter(item => (status === 'all' || item.status === status) && (!day || ('start_date' in item ? item.start_date <= day && item.end_date >= day : item.date === day && (!item.country || item.country === data.settings.country))))
    .sort((a, b) => ('start_date' in a ? a.start_date : a.date).localeCompare('start_date' in b ? b.start_date : b.date) || a.id.localeCompare(b.id))
}
