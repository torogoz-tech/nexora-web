import type { PullRequestLink } from './PullRequestLink'
export type PullRequestLinksPage = {
  items: PullRequestLink[]
  next_cursor: string | null
  restricted: boolean
}
