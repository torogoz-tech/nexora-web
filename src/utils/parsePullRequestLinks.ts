import { requireRecord } from './requireRecord'
import { parsePullRequestLink } from './parsePullRequestLink'
import type { PullRequestLinksPage } from '../types/PullRequestLinksPage'
export function parsePullRequestLinks(value: unknown): PullRequestLinksPage {
  const v = requireRecord(value)
  if (
    !Array.isArray(v.items) ||
    (v.next_cursor !== null && typeof v.next_cursor !== 'string') ||
    typeof v.restricted !== 'boolean'
  )
    throw new Error('La página de vínculos no es válida.')
  return {
    items: v.items.map(parsePullRequestLink),
    next_cursor: v.next_cursor,
    restricted: v.restricted,
  }
}
