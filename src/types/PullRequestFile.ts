export type PullRequestFile = {
  path: string
  previous_path: string
  status: string
  additions: number | null
  deletions: number | null
  patch: string | null
  patch_truncated: boolean
}
