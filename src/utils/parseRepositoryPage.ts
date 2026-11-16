import { requireRecord } from './requireRecord'
import { parseRepository } from './parseRepository'
import type { RepositoryPage } from '../types/RepositoryPage'
export function parseRepositoryPage(value: unknown): RepositoryPage {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.items) ||
    (v.next_cursor !== null && typeof v.next_cursor !== 'string')
  )
    throw new Error('La página de repositorios no es válida.')
  return { items: v.items.map(parseRepository), next_cursor: v.next_cursor }
}
