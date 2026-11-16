import { requireRecord } from './requireRecord'
import type { PullRequestLink } from '../types/PullRequestLink'
export function parsePullRequestLink(value: unknown): PullRequestLink {
  const v = requireRecord(value)
  if (
    typeof v.id !== 'string' ||
    !['task', 'requirement'].includes(String(v.kind)) ||
    typeof v.target_id !== 'string' ||
    typeof v.title !== 'string' ||
    !Number.isSafeInteger(v.revision) ||
    (v.version_id !== null && typeof v.version_id !== 'string') ||
    (v.code !== null && typeof v.code !== 'string') ||
    (v.removed_at !== null && typeof v.removed_at !== 'string')
  )
    throw new Error('La información del vínculo no es válida.')
  return v as PullRequestLink
}
