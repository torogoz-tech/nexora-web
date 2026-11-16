import { requireRecord } from './requireRecord'
import type { PullRequestCheck } from '../types/PullRequestCheck'
export function parsePullRequestCheck(value: unknown): PullRequestCheck {
  const v = requireRecord(value)
  if (
    !['name', 'status', 'web_url', 'provider'].every(
      (key) => typeof v[key] === 'string',
    ) ||
    (v.conclusion !== null && typeof v.conclusion !== 'string')
  )
    throw new Error('La comprobación no es válida.')
  return v as PullRequestCheck
}
