import type { EmailContentTemplate } from '../types/EmailContentTemplate'
import { emailContentLabels } from '../app/emailContentLabels'
export function parseEmailContent(value: unknown): EmailContentTemplate {
  if (!value || typeof value !== 'object') throw Error('La configuración recibida no es válida.')
  const v = value as Record<string, unknown>
  if (!['kind','language','subject','body_html','default_subject','default_body_html'].every(key => typeof v[key] === 'string') ||
    !Object.hasOwn(emailContentLabels, String(v.kind)) || !['es','en'].includes(String(v.language)) ||
    !Number.isSafeInteger(v.revision) || Number(v.revision) < 1 || typeof v.customized !== 'boolean' || typeof v.delivery_enabled !== 'boolean' ||
    !Array.isArray(v.parameters) || !v.parameters.every(p => p && typeof p === 'object' && ['name','description_es','description_en','sample'].every(key => typeof p[key] === 'string') && typeof p.required === 'boolean' && ['text','url'].includes(p.value_kind)))
    throw Error('La configuración recibida no es válida.')
  return v as EmailContentTemplate
}
