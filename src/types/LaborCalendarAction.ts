export type LaborCalendarAction = { mode: 'request' | 'holiday' | 'decision'; path: string; approved?: boolean; initialKind?: 'vacation' | 'leave' }
