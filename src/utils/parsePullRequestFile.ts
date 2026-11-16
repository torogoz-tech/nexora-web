import { requireRecord } from './requireRecord'
import type { PullRequestFile } from '../types/PullRequestFile'
export function parsePullRequestFile(value: unknown): PullRequestFile {
  const v = requireRecord(value)
  if (
    !['path', 'previous_path', 'status'].every(
      (key) => typeof v[key] === 'string',
    ) ||
    (v.patch !== null && typeof v.patch !== 'string') ||
    typeof v.patch_truncated !== 'boolean' ||
    !['additions', 'deletions'].every(
      (key) => v[key] === null || Number.isSafeInteger(v[key]),
    )
  )
    throw new Error('La información del archivo no es válida.')
  return v as PullRequestFile
}
