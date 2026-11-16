import type { CalendarActivity } from '../types/CalendarActivity'
export function calendarActivityOccursOn(item: CalendarActivity, date: string) {
  return item.start_date <= date && item.end_date >= date && (item.all_day || item.end_date !== date || item.end_time !== '00:00')
}
