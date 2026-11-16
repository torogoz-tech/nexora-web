export type LaborCalendar = {
  settings: { timezone: string; country: string; workdays: number[]; daily_minutes: number; work_start: string; work_end: string; break_minutes: number; starts_on: string; revision: number }
  holidays: { kind?: 'holiday' | 'public_holiday'; id: string; name: string; date: string; country: string | null; status: 'pending' | 'approved' | 'rejected'; proposed_by: string; reason: string; decision_reason: string | null; can_decide: boolean; created_at?: string; decided_at?: string | null; decided_by_name?: string | null }[]
  requests: { id: string; actor_id: string; actor_name: string; kind: 'vacation' | 'leave'; start_date: string; end_date: string; minutes_per_day: number | null; reason: string; status: 'pending' | 'approved' | 'rejected'; decision_reason: string | null; can_decide: boolean; created_at?: string; decided_at?: string | null; decided_by_name?: string | null }[]
  members: { id: string; name: string; approver_id: string | null; approver_revision: number }[]
  approvers: { id: string; name: string }[]
  can_manage: boolean
  can_propose_holiday: boolean
  can_create_activity?: boolean
  can_request: boolean
}
