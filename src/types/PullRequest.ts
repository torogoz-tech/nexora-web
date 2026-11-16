export type PullRequest = {
  number: number
  title: string
  description: string
  state: 'open' | 'closed' | 'merged'
  draft: boolean
  web_url: string
  author: string
  source_branch: string
  target_branch: string
  head_sha: string
  base_sha?: string
  created_at: string
  updated_at: string
  mergeable: boolean | null
  additions: number | null
  deletions: number | null
}
