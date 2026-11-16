export type PullRequestLinkInput = {
  kind: 'task' | 'requirement'
  target_id: string
  target_revision: number
  version_id: string | null
  reason: string
}
