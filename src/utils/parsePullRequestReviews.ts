import { requireRecord } from './requireRecord'
import type { PullRequestReview } from '../types/PullRequestReview'
export function parsePullRequestReviews(value: unknown): PullRequestReview[] {
 const v = requireRecord(value)
 if (!Array.isArray(v.items) || v.items.length > 20) throw new Error('La información de las revisiones no es válida.')
 return v.items.map((entry) => {
  const row = requireRecord(entry)
  if (typeof row.id !== 'string' || typeof row.created_at !== 'string' || !['running', 'completed', 'failed', 'stale', 'interrupted'].includes(String(row.status))) throw new Error('La información de las revisiones no es válida.')
  if (row.report !== null) {
   const report = requireRecord(row.report)
   if (typeof report.summary !== 'string' || !Array.isArray(report.limitations) || !report.limitations.every(x => typeof x === 'string') || !Array.isArray(report.findings)) throw new Error('La información de las revisiones no es válida.')
   for (const entry of report.findings) {
    const f = requireRecord(entry)
    if (!['P1', 'P2', 'P3'].includes(String(f.severity)) || !['title', 'body', 'path', 'evidence'].every(k => typeof f[k] === 'string') || !Number.isSafeInteger(f.line) || Number(f.line) < 1) throw new Error('La información de las revisiones no es válida.')
   }
  }
  return row as PullRequestReview
 })
}
