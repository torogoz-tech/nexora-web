import type { EmailAccessSettings } from '../types/EmailAccessSettings'
export function parseEmailAccessSettings(value:unknown):EmailAccessSettings{
  const v=value as Partial<EmailAccessSettings>|null
  if(!v||typeof v.public_web_url!=='string'||!Number.isSafeInteger(v.revision)||Number(v.revision)<1)throw Error('La configuración recibida no es válida.')
  return v as EmailAccessSettings
}
