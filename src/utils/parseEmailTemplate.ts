import type { EmailTemplate } from '../types/EmailTemplate'
export function parseEmailTemplate(value: unknown): EmailTemplate {
  const v = value as Partial<EmailTemplate> | null
  if (!v || typeof v.html !== 'string' || !Number.isSafeInteger(v.revision) || Number(v.revision) < 1)
    throw Error('La configuración recibida no es válida.')
  return v as EmailTemplate
}
