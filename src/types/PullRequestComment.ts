export type PullRequestComment = {
  id: string
  author: string
  body: string
  created_at: string
  path: string | null
  line: number | null
}
