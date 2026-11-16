import type { OvertimeItem } from './OvertimeItem'
export type OvertimeData = { items: OvertimeItem[]; can_request: boolean; can_manage: boolean; total_approved_minutes: number }
