import type { DropdownOption } from './DropdownOption'
export type DropdownProps = {
  label: string
  value: string
  options: DropdownOption[]
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  name?: string
  className?: string
}
