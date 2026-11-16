import type { GitProvider } from './GitProvider'
import type { GitProviderConfiguration } from './GitProviderConfiguration'
export type ProviderConfigurationFormProps = {
  provider: GitProvider
  configuration: GitProviderConfiguration | null
  onSaved: (configuration: GitProviderConfiguration) => void
}
