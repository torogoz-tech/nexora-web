export type EmailTemplateParameter = {
  name: string
  description_es: string
  description_en: string
  sample: string
  required: boolean
  value_kind: 'text' | 'url'
}
