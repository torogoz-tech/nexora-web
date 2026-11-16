import type { ReactNode } from 'react'
export type RowActionProps = {
  label: string
  children: ReactNode
  variant?: 'ghost' | 'primary' | 'outline'
  hint?: string
} & (
  | {
      to: string
      href?: never
      onClick?: never
      disabled?: never
      type?: never
    }
  | {
      href: string
      to?: never
      onClick?: never
      disabled?: never
      type?: never
    }
  | {
      to?: never
      href?: never
      onClick?: () => void
      disabled?: boolean
      type?: 'button' | 'submit'
    }
)
