import type { GitConnection } from './GitConnection'
export type GitConnectionPage = {
  items: GitConnection[]
  next_cursor: string | null
}
