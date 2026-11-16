import type { ButtonHTMLAttributes } from 'react'
export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'title'
> & {
  label: string
  hint?: string
  variant?: 'ghost' | 'primary' | 'outline' | 'error'
}
