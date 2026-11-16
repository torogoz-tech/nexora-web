import type { RepositoryBranchProtection } from '../types/RepositoryBranchProtection'
import { requireRecord } from './requireRecord'
import { parseBranchProtectionReport } from './parseBranchProtectionReport'
export function parseRepositoryBranchProtection(value: unknown): RepositoryBranchProtection {
 const record = requireRecord(value)
 if (!Number.isSafeInteger(record.revision) || Number(record.revision) < 0 || !['unconfigured', 'prepared', 'applying', 'applied', 'failed'].includes(String(record.status)) || !Array.isArray(record.required_checks) || !record.required_checks.every(check => typeof check === 'string' && check.length <= 255)) throw Error('La respuesta de protección de ramas no es válida.')
 const plan = parseBranchProtectionReport(record.plan)
 const result = record.status === 'applied' ? parseBranchProtectionReport(record.result) : null
 if (record.status === 'prepared' && !plan || record.status === 'applied' && (!result?.verified || result.branches.some(branch => !branch.verified))) throw Error('La respuesta de protección de ramas no es válida.')
 return { revision: Number(record.revision), status: record.status as RepositoryBranchProtection['status'], required_checks: record.required_checks as string[], plan, result }
}
