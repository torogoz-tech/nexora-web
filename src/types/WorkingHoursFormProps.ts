import type { LaborCalendar } from './LaborCalendar'
export type WorkingHoursFormProps = { settings: LaborCalendar['settings']; busy: boolean; onError: (message: string) => void; onSave: (input: Record<string, unknown>) => Promise<boolean> }
