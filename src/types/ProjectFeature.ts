export type ProjectFeature = {
  id: string
  name: string
  description: string
  revision: number
  status?: 'active' | 'completed'
  completed_at?: string | null
  archived: boolean
  requirement_ids: string[]
  task_ids: string[]
  created_at: string
}
