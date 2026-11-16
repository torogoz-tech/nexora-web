export type LaborCalendarFormProps = {
  mode: 'request' | 'holiday' | 'decision'
  initialKind?: 'vacation' | 'leave'
  initialDate?: string
  busy: boolean
  error: string | null
  country: string
  approved?: boolean
  directHoliday?: boolean
  onClose: () => void
  onSubmit: (input: Record<string, unknown>) => Promise<void>
}
