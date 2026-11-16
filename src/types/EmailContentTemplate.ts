import type { EmailTemplateParameter } from './EmailTemplateParameter'
export type EmailContentTemplate = {
  kind: string
  language: 'es' | 'en'
  subject: string
  body_html: string
  default_subject: string
  default_body_html: string
  revision: number
  parameters: EmailTemplateParameter[]
  customized: boolean
  delivery_enabled: boolean
}
