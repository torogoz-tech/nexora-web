export function renderEmailPreview(html: string, organization: string, subject: string, body: string, bodyIsHtml = false): string {
  const escape = (text: string) => text.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!))
  const values: Record<string, string> = {
    '{{organization_name}}': escape(organization),
    '{{subject}}': escape(subject),
    '{{body}}': bodyIsHtml ? body : escape(body).replace(/\n/g, '<br>'),
  }
  const rendered = html.replace(/\{\{(?:organization_name|subject|body)\}\}/g, token => values[token])
  // CSP is placed first; sandbox also blocks scripts, forms, navigation and origin access.
  return `<!doctype html><html><head><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'; base-uri 'none'; form-action 'none'"></head><body>${rendered}</body></html>`
}
