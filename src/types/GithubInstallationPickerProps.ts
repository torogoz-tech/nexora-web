import type { GithubConsent } from './GithubConsent'
export type GithubInstallationPickerProps = {
  consent: GithubConsent
  onDone: () => void
  onCancel: () => void
}
