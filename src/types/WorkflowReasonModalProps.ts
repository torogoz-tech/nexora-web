export type WorkflowReasonModalProps = {
  action: 'save' | 'publish'
  busy: boolean
  error: string | null
  onClose: () => void
  onConfirm: (reason: string) => Promise<void>
}
