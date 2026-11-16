import { afterEach, expect, it, vi } from 'vitest'
import { submitPublicEmailAction } from './submitPublicEmailAction'
afterEach(()=>vi.unstubAllGlobals())
it('submits recovery anonymously and treats accepted responses identically',async()=>{
 const request=vi.fn(async()=>new Response(null,{status:202}))
 vi.stubGlobal('fetch',request)
 const signal=new AbortController().signal
 expect(await submitPublicEmailAction('/api/v1/auth/password/request',{email:'sample@example.invalid'},signal)).toBeNull()
 const [url,options]=request.mock.calls[0] as unknown as [string,RequestInit]
 expect(url).toBe('/api/v1/auth/password/request')
 expect(options.credentials).toBe('omit')
 expect(options.method).toBe('POST')
 expect(options.headers).not.toHaveProperty('Authorization')
})
it('does not send secrets to a caller supplied endpoint',async()=>{
 const request=vi.fn();vi.stubGlobal('fetch',request)
 await expect(submitPublicEmailAction('https://example.invalid',{},new AbortController().signal)).rejects.toThrow('invalid-email-action-path')
 expect(request).not.toHaveBeenCalled()
})
it('reports invalid consumed links without exposing server details',async()=>{
 vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify({title:'invalid invitation token'}),{status:422})))
 await expect(submitPublicEmailAction('/api/v1/auth/invitations/inspect',{},new AbortController().signal)).rejects.toThrow('El enlace no es válido, venció o ya fue utilizado. Solicita uno nuevo.')
})
