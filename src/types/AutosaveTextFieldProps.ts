export type AutosaveTextFieldProps = {
  label: string
  value: string
  onCommit: (value: string) => Promise<boolean>
  disabled?: boolean
  autoSave?: boolean
  saveBlocked?: boolean
  type?: 'text' | 'password' | 'email' | 'url' | 'tel' | 'date'
  multiline?: boolean
  maxLength?: number
  placeholder?: string
}
