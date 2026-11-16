import type { GitConnection } from './GitConnection'
export type ConnectionAccessModalProps = {
  connection: GitConnection
  onClose: () => void
}
