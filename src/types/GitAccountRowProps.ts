import type { GitConnection } from './GitConnection'
export type GitAccountRowProps = {
  account: GitConnection
  onAccess: (account: GitConnection) => void
  onRevoke: (account: GitConnection) => void
}
