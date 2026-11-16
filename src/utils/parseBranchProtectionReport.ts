import type { BranchProtectionReport } from '../types/BranchProtectionReport'
import { requireRecord } from './requireRecord'
export function parseBranchProtectionReport(value: unknown): BranchProtectionReport | null {
 if (value === null) return null
 const report = requireRecord(value)
 if (!['github', 'gitlab'].includes(String(report.provider)) || typeof report.verified !== 'boolean' || typeof report.requires_human_merge_gate !== 'boolean' || !Array.isArray(report.branches) || report.branches.length !== 4 || !Array.isArray(report.limitations)) throw Error('La respuesta de protección de ramas no es válida.')
 const branches = report.branches.map(value => {
  const branch = requireRecord(value)
  if (!['main', 'develop', 'stage', 'preprod'].includes(String(branch.name)) || branch.status !== 'existing' || typeof branch.verified !== 'boolean') throw Error('La respuesta de protección de ramas no es válida.')
  return { name: String(branch.name), status: 'existing' as const, verified: branch.verified }
 })
 if (new Set(branches.map(branch => branch.name)).size !== 4) throw Error('La respuesta de protección de ramas no es válida.')
 return { provider: report.provider as 'github' | 'gitlab', branches, verified: report.verified, requires_human_merge_gate: report.requires_human_merge_gate, has_limitations: report.limitations.length > 0 }
}
