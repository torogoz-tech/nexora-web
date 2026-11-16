export type DailyDeveloperAnalysis = {
 member_id: string
 date: string
 status: 'pending' | 'running' | 'complete' | 'no_evidence' | 'failed' | 'not_available'
 timezone?: string
 generated_at?: string | null
 report?: { summary: string } | null
 evidence?: { items: { kind: string; id: string; title: string; detail: string; occurred_at: string }[]; counts: Record<string, number> } | null
}
