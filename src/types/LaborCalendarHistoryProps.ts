import type { LaborCalendar } from './LaborCalendar'
import type { LaborCalendarAction } from './LaborCalendarAction'
export type LaborCalendarHistoryProps = { data: LaborCalendar; busy: boolean; initialMemberId?: string; onAction: (action: LaborCalendarAction) => void }
