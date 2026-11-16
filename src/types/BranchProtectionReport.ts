export type BranchProtectionReport = {
 provider: 'github' | 'gitlab'
 branches: { name: string; status: 'existing'; verified: boolean }[]
 verified: boolean
 requires_human_merge_gate: boolean
 has_limitations: boolean
}
