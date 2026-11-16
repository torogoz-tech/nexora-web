import type { ReactNode } from 'react'
export type IntegrationDialogProps = {
  title: string
  busy?: boolean
  className?: string
  onClose: () => void
  children: ReactNode
}
