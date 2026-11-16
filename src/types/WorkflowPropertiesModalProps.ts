import type { ReactNode } from 'react'
export type WorkflowPropertiesModalProps = {
  kind: 'state' | 'transition'
  name: string
  fullPage?: boolean
  onClose: () => void
  children: ReactNode
}
