import type { EmailContentTemplate } from '../types/EmailContentTemplate'
export function renderEmailContentPreview(item: EmailContentTemplate, subject: string, body: string, organization: string) {
  const escape = (text:string) => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
  const values = Object.fromEntries(item.parameters.map(p => [p.name, p.name === 'organization_name' ? organization : p.sample]))
  const replace = (source:string, html:boolean) => source.replace(/\{\{([^{}]+)\}\}/g, (token,key:string) => {
    const value = Object.hasOwn(values,key) ? values[key] : token
    return html ? escape(value) : value
  })
  return {subject: replace(subject,false),body:replace(body,true)}
}
