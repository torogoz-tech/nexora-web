import type { OvertimeEvidence } from './OvertimeEvidence'
export type OvertimeItem = OvertimeEvidence & {
  id: string
  actor_id: string
  actor_name: string
  date: string
  start_time: string
  end_time: string
  next_day: boolean
  minutes: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  decision_reason: string | null
  decided_by_name: string | null
  decided_at: string | null
  created_at: string
  can_decide: boolean
}
