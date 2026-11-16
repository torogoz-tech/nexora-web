// @vitest-environment jsdom
import { afterEach, expect, it, vi } from 'vitest'
import { readMemberAvatar, clearMemberAvatarCache } from '../src/services/memberAvatarCache'
import { apiFetch } from '../src/services/apiFetch'
vi.mock('../src/services/apiFetch', () => ({ apiFetch: vi.fn() }))
afterEach(() => { clearMemberAvatarCache(); vi.restoreAllMocks() })
it('shares one download and blob URL across simultaneous avatars and remounts', async () => {
 vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:shared')
 vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
 vi.mocked(apiFetch).mockResolvedValue(new Response('png', { headers: { 'Content-Type': 'image/png' } }))
 const urls = await Promise.all(Array.from({ length: 20 }, () => readMemberAvatar('ana', 2)))
 expect(new Set(urls)).toEqual(new Set(['blob:shared']))
 expect(apiFetch).toHaveBeenCalledTimes(1)
 expect(await readMemberAvatar('ana')).toBe('blob:shared')
 expect(apiFetch).toHaveBeenCalledTimes(1)
})
it('refreshes once for a changed photo and clears private cached photos at logout', async () => {
 vi.mocked(apiFetch).mockClear()
 vi.spyOn(URL, 'createObjectURL').mockReturnValueOnce('blob:old').mockReturnValueOnce('blob:new')
 const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})
 vi.mocked(apiFetch).mockImplementation(async () => new Response('png', { headers: { 'Content-Type': 'image/png' } }))
 await readMemberAvatar('ana', 1)
 window.dispatchEvent(new CustomEvent('nexora:avatar-changed', { detail: { actorId: 'ana', revision: 2 } }))
 expect(await Promise.all([readMemberAvatar('ana', 2), readMemberAvatar('ana', 2)])).toEqual(['blob:new', 'blob:new'])
 expect(apiFetch).toHaveBeenCalledTimes(2)
 clearMemberAvatarCache()
 expect(revoke).toHaveBeenCalledWith('blob:new')
})
