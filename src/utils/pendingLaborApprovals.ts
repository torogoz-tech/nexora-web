import type { LaborCalendar } from '../types/LaborCalendar'
import type { OvertimeData } from '../types/OvertimeData'
import type { PendingApproval } from '../types/PendingApproval'
export function pendingLaborApprovals(calendar: LaborCalendar | null, overtime: OvertimeData | null): PendingApproval[] {
  return [
    ...(calendar?.requests.filter(item => item.status === 'pending').map(item => ({ id: item.id, kind: item.kind, title: item.actor_name, member: item.actor_name, date: item.start_date, endDate: item.end_date, reason: item.reason, canDecide: item.can_decide, path: `/api/v1/labor-calendar/requests/${encodeURIComponent(item.id)}/decision` })) ?? []),
    ...(calendar?.holidays.filter(item => item.status === 'pending').map(item => ({ id: item.id, kind: 'holiday' as const, title: item.name, member: '', date: item.date, reason: item.reason, canDecide: item.can_decide, path: `/api/v1/labor-calendar/holidays/${encodeURIComponent(item.id)}/decision` })) ?? []),
    ...(overtime?.items.filter(item => item.status === 'pending').map(item => ({ id: item.id, kind: 'overtime' as const, title: item.actor_name, member: item.actor_name, date: item.date, reason: item.reason, canDecide: item.can_decide, path: `/api/v1/overtime/${encodeURIComponent(item.id)}/decision` })) ?? []),
  ]
}
