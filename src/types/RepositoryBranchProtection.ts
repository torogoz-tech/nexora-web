import type { BranchProtectionReport } from './BranchProtectionReport'
export type RepositoryBranchProtection = {
 revision: number
 status: 'unconfigured' | 'prepared' | 'applying' | 'applied' | 'failed'
 required_checks: string[]
 plan: BranchProtectionReport | null
 result: BranchProtectionReport | null
}
