import { afterEach, expect, it, vi } from 'vitest'
import { writeMemberAvatar } from '../src/services/writeMemberAvatar'
import { parseOrganizationMembers } from '../src/utils/parseOrganizationMembers'
import { sessionStore } from '../src/app/sessionStore'
afterEach(()=>{sessionStore.current=null;vi.unstubAllGlobals()})
it('uploads only to the authenticated own-avatar endpoint with a retry key',async()=>{
 const fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({avatar_revision:2}),{status:200}))
 vi.stubGlobal('fetch',fetch)
 expect(await writeMemberAvatar('encoded-raster',new AbortController().signal,'upload-receipt')).toBe(2)
 const [path,init]=fetch.mock.calls[0]
 expect(path).toBe('/api/v1/me/avatar')
 expect(init.method).toBe('PUT')
 expect(init.headers.get('Idempotency-Key')).toBe('upload-receipt')
 expect(JSON.parse(init.body)).toEqual({image_base64:'encoded-raster'})
})
it('removes the photo without embedding member IDs or image data in a URL',async()=>{
 const fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({avatar_revision:3}),{status:200}))
 vi.stubGlobal('fetch',fetch)
 await writeMemberAvatar(null,new AbortController().signal,'delete-receipt')
 expect(fetch.mock.calls[0][0]).toBe('/api/v1/me/avatar')
 expect(fetch.mock.calls[0][1].method).toBe('DELETE')
 expect(fetch.mock.calls[0][1].body).toBeUndefined()
})
it('rejects denied writes and invalid revisions without reflecting server secrets',async()=>{
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({detail:'private'}),{status:403})))
 await expect(writeMemberAvatar('encoded',new AbortController().signal,'key')).rejects.toThrow('Solo puedes cambiar tu propia foto')
 vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({avatar_revision:-1}),{status:200})))
 await expect(writeMemberAvatar(null,new AbortController().signal,'key')).rejects.toThrow('La respuesta de la foto no es válida.')
})
it('accepts only a valid nonnegative avatar revision from the directory',()=>{
 const member={id:'person',name:'Ana',username:'ana',email:'',active:true,avatar_revision:2}
 expect(parseOrganizationMembers([member])[0].avatar_revision).toBe(2)
 expect(()=>parseOrganizationMembers([{...member,avatar_revision:-1}])).toThrow()
})
