import { describe, expect, it } from 'vitest'
import { validateEmailContent } from './validateEmailContent'
import { renderEmailContentPreview } from './renderEmailContentPreview'
import { renderEmailPreview } from './renderEmailPreview'
import { parseEmailContent } from './parseEmailContent'
import type { EmailContentTemplate } from '../types/EmailContentTemplate'
const item: EmailContentTemplate = {
  kind:'invitation',language:'en',subject:'{{organization_name}}',body_html:'<a href="{{invitation_url}}">Join</a> {{expires_at}}',
  default_subject:'{{organization_name}}',default_body_html:'<a href="{{invitation_url}}">Join</a> {{expires_at}}',revision:1,customized:false,delivery_enabled:false,
  parameters:[
    {name:'organization_name',description_es:'Organización',description_en:'Organization',sample:'Acme',required:false,value_kind:'text'},
    {name:'invitation_url',description_es:'Enlace',description_en:'Link',sample:'https://example.com/?a=1&b=2',required:true,value_kind:'url'},
    {name:'expires_at',description_es:'Vence',description_en:'Expires',sample:'<Tomorrow>',required:true,value_kind:'text'},
  ],
}
describe('localized email contents',()=>{
  it('validates required parameters, unknown names and header characters',()=>{
    expect(validateEmailContent(item,item.subject,item.body_html)).toBeNull()
    expect(validateEmailContent(item,'Subject','Missing parameters')).not.toBeNull()
    expect(validateEmailContent(item,'Subject\r\nBcc: user@example.com',item.body_html)).not.toBeNull()
    expect(validateEmailContent(item,'Subject',item.body_html+'{{secret}}')).not.toBeNull()
    expect(validateEmailContent(item,'Subject',item.body_html+'{{unfinished')).not.toBeNull()
    expect(validateEmailContent(item,'Subject',item.body_html+'é'.repeat(50000))).not.toBeNull()
  })
  it('renders samples once with escaped values inside preserved HTML',()=>{
    const result=renderEmailContentPreview(item,item.subject,item.body_html,'<Org> {{expires_at}}')
    expect(result.subject).toBe('<Org> {{expires_at}}')
    expect(result.body).toContain('href="https://example.com/?a=1&amp;b=2"')
    expect(result.body).toContain('&lt;Tomorrow&gt;')
    const preview=renderEmailPreview('<h1>{{subject}}</h1><main>{{body}}</main>','Org',result.subject,result.body,true)
    expect(preview).toContain('<main><a href=')
    expect(preview).toContain('&lt;Org&gt; {{expires_at}}')
    expect(preview).toContain("default-src 'none'")
  })
  it('checks catalog metadata and language identities',()=>{
    expect(parseEmailContent(item).language).toBe('en')
    for(const patch of [{language:'fr'},{kind:'unknown'},{revision:0},{parameters:[{name:'link'}]}])expect(()=>parseEmailContent({...item,...patch})).toThrow()
  })
})
