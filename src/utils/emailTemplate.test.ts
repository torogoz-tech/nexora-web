import { describe, expect, it } from 'vitest'
import { renderEmailPreview } from './renderEmailPreview'
import { validateEmailTemplate } from './validateEmailTemplate'
import { parseEmailTemplate } from './parseEmailTemplate'
describe('email template', () => {
  it('requires a single body and known complete tokens', () => {
    expect(validateEmailTemplate('<p>{{body}}</p>')).toBeNull()
    for (const html of ['', '{{body}}{{body}}', '{{other}}{{body}}', '{{body}}{{oops']) expect(validateEmailTemplate(html)).not.toBeNull()
    expect(validateEmailTemplate('{{body}}' + 'é'.repeat(50000))).not.toBeNull()
  })
  it('escapes dynamic values once and confines preview resources', () => {
    const result = renderEmailPreview('{{organization_name}} {{subject}} {{body}}', '<Acme>', '{{body}}', '<script>evil()</script>\nSecond line')
    expect(result).toContain('&lt;Acme&gt; {{body}} &lt;script&gt;evil()&lt;/script&gt;<br>Second line')
    expect(result).toContain("default-src 'none'")
    expect(result).toContain("form-action 'none'")
    expect(result).toContain("img-src data:")
  })
  it('does not add a subject heading that is absent from the editable HTML', () => {
    const output = renderEmailPreview('<main>{{body}}</main>', 'Acme', 'Inbox subject only', '<p>Visible content</p>', true)
    expect(output).not.toContain('Inbox subject only')
    expect(output).not.toContain('<h1')
    expect(output).toContain('<main><p>Visible content</p></main>')
  })
  it('rejects missing or malformed server revisions', () => {
    expect(parseEmailTemplate({html:'{{body}}',revision:1}).revision).toBe(1)
    for (const revision of [0, '1', null, 1.5]) expect(() => parseEmailTemplate({html:'{{body}}',revision})).toThrow()
  })
})
