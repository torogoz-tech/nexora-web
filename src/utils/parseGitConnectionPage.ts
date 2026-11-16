import { requireRecord } from './requireRecord'
import { parseGitConnection } from './parseGitConnection'
import type { GitConnectionPage } from '../types/GitConnectionPage'
export function parseGitConnectionPage(value: unknown): GitConnectionPage {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.items) ||
    (v.next_cursor !== null && typeof v.next_cursor !== 'string')
  )
    throw new Error('La lista de conexiones no es válida.')
  return { items: v.items.map(parseGitConnection), next_cursor: v.next_cursor }
}
