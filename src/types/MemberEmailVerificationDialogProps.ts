export type MemberEmailVerificationDialogProps = {
  email: string
  code: string
  busy: boolean
  error: string
  onCodeChange: (code: string) => void
  onVerify: () => void
  onChangeAddress: () => void
  onClose: () => void
}
