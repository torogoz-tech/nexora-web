export type KnowledgeContribution = {
  id: string
  revision: number
  actor: string
  created_at: string
  state: string
  validity: string
  effective: boolean
  snapshot: string
  operation: string
  reason: string
  draft: {
    kind: string
    statement: string
    source: string | null
    target: string | null
    relation: string | null
    evidence: { path: string; start_line: number; line_count: number }[]
  }
}
