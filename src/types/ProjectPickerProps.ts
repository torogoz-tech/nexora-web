import type { useProjectScope } from '../hooks/useProjectScope'
export type ProjectPickerProps = {
  scope: ReturnType<typeof useProjectScope>
  onChange: (id: string) => void
  disabled?: boolean
}
