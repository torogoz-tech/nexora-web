export type PullRequestLink = {
  id: string
  kind: 'task' | 'requirement'
  target_id: string
  version_id: string | null
  title: string
  code: string | null
  revision: number
  removed_at: string | null
}
