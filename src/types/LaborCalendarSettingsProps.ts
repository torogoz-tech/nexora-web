import type { LaborCalendar } from './LaborCalendar'
export type LaborCalendarSettingsProps = {
  data: LaborCalendar
  busy: boolean
  onSave: (path: string, input: Record<string, unknown>) => Promise<boolean>
}
