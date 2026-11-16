export type TotpSetupScreenProps = {
  secret: string
  uri: string
  busy: boolean
  onSetup: () => void
  onContinue: () => void
}
