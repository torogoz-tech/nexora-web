import type { GitConnection } from './GitConnection'
export type RevokeConnectionModalProps = {
  connection: GitConnection
  onClose: () => void
  onRevoked: () => void
}
