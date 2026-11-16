import { requireRecord } from './requireRecord'
import type { PullRequestComment } from '../types/PullRequestComment'
export function parsePullRequestComment(value: unknown): PullRequestComment {
  const v = requireRecord(value)
  if (
    !['id', 'author', 'body', 'created_at'].every(
      (key) => typeof v[key] === 'string',
    ) ||
    (v.path !== null && typeof v.path !== 'string') ||
    (v.line !== null && !Number.isSafeInteger(v.line))
  )
    throw new Error('El comentario no es válido.')
  return v as PullRequestComment
}
