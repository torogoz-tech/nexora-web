import type { EmailContentTemplate } from '../types/EmailContentTemplate'
export function validateEmailContent(item: EmailContentTemplate, subject: string, body: string): string | null {
  const bytes = (v:string) => new TextEncoder().encode(v).length
  if (!subject.trim() || bytes(subject)>1000 || Array.from(subject).some(c => c.charCodeAt(0) < 32 || (c.charCodeAt(0) >= 127 && c.charCodeAt(0) <= 159)) || !body.trim() || bytes(body)>100000)
    return 'Revisa el asunto y el contenido: son obligatorios y no pueden superar 1 KB y 100 KB.'
  const tokens = (subject+body).match(/\{\{[\s\S]*?(?:\}\}|$)/g) ?? []
  if (tokens.some(token => !item.parameters.some(p => `{{${p.name}}}` === token))) return 'Utiliza únicamente los parámetros disponibles para este correo.'
  if (item.parameters.some(p => p.required && !body.includes(`{{${p.name}}}`))) return 'Conserva todos los parámetros obligatorios en el contenido del correo.'
  if (typeof DOMParser !== 'undefined') {
    const document = new DOMParser().parseFromString(body, 'text/html')
    const links = Array.from(document.querySelectorAll('a[href]'))
    if (item.parameters.some(p => p.required && p.value_kind === 'url' && !links.some(a => a.getAttribute('href') === `{{${p.name}}}`)))
      return 'Conserva los enlaces obligatorios con su parámetro original en el atributo href.'
  }
  return null
}
