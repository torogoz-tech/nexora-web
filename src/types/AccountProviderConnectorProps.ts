import type { GitProvider } from './GitProvider'
export type AccountProviderConnectorProps = {
  provider: GitProvider
  onConnected: () => void
}
