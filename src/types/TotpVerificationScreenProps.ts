export type TotpVerificationScreenProps = {
  code: string
  busy: boolean
  invalid: boolean
  enrolling: boolean
  onChange: (value: string) => void
  onVerify: () => void
  onBack: () => void
}
