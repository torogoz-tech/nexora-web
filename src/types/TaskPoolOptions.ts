export type TaskPoolOptions = {
  types: { purpose?: import('./TaskPurpose').TaskPurpose; code: string; name: string; icon?: string | null; color?: string | null }[]
  workflows?: { id: string; name: string; assignee_ids: string[] }[]
  assignees: { actor_id: string; name: string }[]
}
