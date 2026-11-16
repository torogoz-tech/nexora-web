import type { ButtonHTMLAttributes } from 'react'
export type TextButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label' | 'title'
> & {
  label: string
  variant?: 'ghost' | 'primary' | 'outline' | 'error'
}
