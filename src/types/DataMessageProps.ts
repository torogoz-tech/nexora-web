export type DataMessageProps = {
  loading?: boolean
  error?: string | null
  message?: string
  onRetry?: () => void
}
