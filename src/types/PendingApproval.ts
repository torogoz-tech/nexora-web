export type PendingApproval = {
  id: string
  kind: 'vacation' | 'leave' | 'holiday' | 'overtime' | 'task' | 'document_version'
  title: string
  member: string
  date: string
  endDate?: string
  reason: string
  path: string
  canDecide: boolean
  revision?: number
  project?: string
  resourceId?: string
}
