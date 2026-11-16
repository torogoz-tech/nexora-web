import { requireRecord } from './requireRecord'
import type { PullRequest } from '../types/PullRequest'
export function parsePullRequest(value: unknown): PullRequest {
  const v = requireRecord(value)
  if (
    !Number.isSafeInteger(v.number) ||
    Number(v.number) <= 0 ||
    !['open', 'closed', 'merged'].includes(String(v.state)) ||
    typeof v.draft !== 'boolean' ||
    ![
      'title',
      'description',
      'web_url',
      'author',
      'source_branch',
      'target_branch',
      'head_sha',
      'created_at',
      'updated_at',
    ].every((key) => typeof v[key] === 'string') ||
    ![null, true, false].includes(v.mergeable as boolean | null) ||
    !['additions', 'deletions'].every(
      (key) => v[key] === null || Number.isSafeInteger(v[key]),
    )
  )
    throw new Error('La información de la PR no es válida.')
  if(v.base_sha !== undefined && typeof v.base_sha !== 'string') throw new Error('La información de la PR no es válida.')
  return v as PullRequest
}
