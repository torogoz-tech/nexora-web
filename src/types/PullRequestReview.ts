export type PullRequestReview = {
 id: string
 head_sha: string
 base_sha: string
 status: 'running' | 'completed' | 'failed' | 'stale' | 'interrupted'
 created_at: string
 model: string | null
 report: { summary: string; limitations: string[]; findings: { severity: string; title: string; body: string; path: string; line: number; evidence: string }[] } | null
}
