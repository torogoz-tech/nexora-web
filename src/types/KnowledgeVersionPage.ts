export type KnowledgeVersionPage = {
  items: {
    id: string
    number: number
    title: string
    created_by: string
    created_at: string
  }[]
  next_before: number | null
}
