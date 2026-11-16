import { afterEach, expect, it, vi } from 'vitest'
import { parseOidcProvider } from '../src/utils/parseOidcProvider'
import { parseOidcSettingsPage } from '../src/utils/parseOidcSettingsPage'
import { writeOidcConfiguration } from '../src/services/writeOidcConfiguration'
const provider={id:'idp_test',name:'Corporate directory',issuer:'https://identity.example/tenant',client_id:'client',redirect_uri:'https://web.example/api/v1/auth/oidc/callback',enabled:true,revision:1,created_at:'2026-11-07',updated_at:'2026-11-07'}
afterEach(()=>{vi.unstubAllGlobals();vi.restoreAllMocks()})
it('retains only public OIDC metadata, even if an unexpected API response contains credentials',()=>{
 const result=parseOidcProvider({...provider,client_secret:'must-not-retain',tokens:{access_token:'private'}})
 expect(result).toEqual(provider)
 expect(JSON.stringify(result)).not.toContain('must-not-retain')
 expect(result).not.toHaveProperty('tokens')
})
it('validates provider revisions and reads callback policy with older API compatibility',()=>{
 expect(()=>parseOidcProvider({...provider,revision:0})).toThrow()
 expect(()=>parseOidcSettingsPage({items:[provider],allowed_callback_origins:[1]})).toThrow()
 expect(parseOidcSettingsPage({items:[provider]}).allowed_callback_origins).toEqual([])
 expect(parseOidcSettingsPage({items:[provider],allowed_callback_origins:['https://web.example']}).items).toEqual([provider])
})
it('updates only the OIDC endpoint with revision and a retry receipt',async()=>{
 const fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({...provider,revision:2}),{status:200}))
 vi.stubGlobal('fetch',fetch)
 await writeOidcConfiguration('/api/v1/auth/oidc/providers/idp_test','PATCH',{name:'New name',expected_revision:1},new AbortController().signal,'receipt')
 const [path,init]=fetch.mock.calls[0]
 expect(path).toBe('/api/v1/auth/oidc/providers/idp_test')
 expect(init.method).toBe('PATCH')
 expect(init.headers.get('Idempotency-Key')).toBe('receipt')
 expect(JSON.parse(init.body)).toEqual({name:'New name',expected_revision:1})
 await expect(writeOidcConfiguration('https://evil.example','POST',{},new AbortController().signal,'receipt')).rejects.toThrow('invalid-oidc-path')
 expect(fetch).toHaveBeenCalledTimes(1)
})
it('explains rejected credential changes without exposing provider error details',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({title:'OIDC client or callback change requires a new client secret',detail:'sensitive-value'}),{status:422})))
 await expect(writeOidcConfiguration('/api/v1/auth/oidc/providers/idp_test','PATCH',{},new AbortController().signal,'receipt')).rejects.toThrow('Al cambiar Client ID o URL de retorno, introduce de nuevo el Client secret.')
})

it('renders labeled setup controls and an explicit initial setup action',async()=>{
 const {createElement}=await import('react')
 const {renderToStaticMarkup}=await import('react-dom/server')
 const {default:Create}=await import('../src/components/OidcProviderCreateForm')
 const html=renderToStaticMarkup(createElement(Create,{callback:provider.redirect_uri,onCreated:()=>{},onCancel:()=>{}}))
 expect(html).toContain('Client ID')
 expect(html).toContain('Client secret')
 expect(html).toContain('type="password"')
 expect(html).toContain('Agregar proveedor')
 expect(html).toContain(provider.redirect_uri)
})
it('keeps saved credentials empty and offers independent autosave fields',async()=>{
 const {createElement}=await import('react')
 const {renderToStaticMarkup}=await import('react-dom/server')
 const {default:Editor}=await import('../src/components/OidcProviderEditor')
 const html=renderToStaticMarkup(createElement(Editor,{provider,onUpdated:()=>{},onReload:()=>{}}))
 expect(html).toContain('type="password"')
 expect(html).toContain('value=""')
 expect(html).toContain(provider.issuer)
 expect(html).not.toContain('Changes saved')
 expect(html).not.toContain('type="submit"')
})
