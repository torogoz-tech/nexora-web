export type HtmlCodeEditorProps = {
  parameters?: string[]
  value: string
  onChange: (value: string) => void
  onSave: () => void
}
