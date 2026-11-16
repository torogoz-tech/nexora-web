import type { CalendarActivity } from './CalendarActivity'
import type { LaborCalendar } from './LaborCalendar'
export type LaborCalendarMonthProps = { data: LaborCalendar; selectedDate?: string | null; onSelectDate?: (date: string) => void; activities?: CalendarActivity[]; offset?: number; onOffsetChange?: (value: number) => void }
