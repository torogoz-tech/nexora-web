import type { ReactNode } from 'react'
export type ServiceSettingsEditorProps = {
  kind: 'openai' | 'smtp'
  title: string
  description: string
  fields: { key: string; label: string; type?: 'text' | 'url' | 'email' }[]
  children?: ReactNode
}
