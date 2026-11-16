import type {CalendarActivity} from './CalendarActivity'
import type { LaborCalendar } from './LaborCalendar'
import type { LaborCalendarAction } from './LaborCalendarAction'
export type LaborCalendarAgendaProps = { data: LaborCalendar; busy: boolean; selectedDate: string | null; onShowAll: () => void; onAction: (action: LaborCalendarAction) => void; title?: string; kind?: 'requests' | 'holidays'; activities?:CalendarActivity[];onEditActivity?:(item:CalendarActivity)=>void;onCancelActivity?:(item:CalendarActivity)=>void;onRespondActivity?:(item:CalendarActivity,response:'attending'|'declined')=>void;standalone?: boolean }
