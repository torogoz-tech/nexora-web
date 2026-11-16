export type DebouncedFieldSaveOptions = {
  onCommit: (value: string) => Promise<boolean>
  onSaved: (value: string) => void
  onSaving: (saving: boolean) => void
  onError: (error: unknown) => void
  shouldSave: (value: string) => boolean
  isValid: () => boolean
  onInvalid?: () => void
}
