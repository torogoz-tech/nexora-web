// @vitest-environment jsdom
import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import AuthProvider from '../app/AuthProvider'
import { useAuth } from '../hooks/useAuth'
import { sessionStore } from '../app/sessionStore'
import { apiFetch } from '../services/apiFetch'
import { parseBrowserSession } from '../utils/parseBrowserSession'
const metadata = { browser_session: true, actor_id: 'actor', session_id: 'ses_1', expires_in: 3600 }
function Probe() { const auth = useAuth(); return <><p>{auth.status}:{auth.session?.actorId}</p><button onClick={() => void auth.logout()}>Logout</button></> }
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); sessionStore.current = undefined })
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals() })
it('a newly opened tab restores cookie session metadata without stored credentials', async () => {
 const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(metadata)))
 vi.stubGlobal('fetch', fetcher)
 render(<AuthProvider><Probe /></AuthProvider>)
 await screen.findByText('authenticated:actor')
 expect(fetcher.mock.calls[0][0]).toBe('/api/v1/auth/session')
 expect(fetcher.mock.calls[0][1].credentials).toBe('same-origin')
 expect(fetcher.mock.calls[0][1].headers.has('Authorization')).toBe(false)
 expect(sessionStorage.length).toBe(0)
 expect(sessionStore.current).not.toHaveProperty('accessToken')
})
it('logout revokes the shared cookie and broadcasts only a change marker', async () => {
 vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(metadata))).mockResolvedValueOnce(new Response(null, {status:204})))
 render(<AuthProvider><Probe /></AuthProvider>)
 await screen.findByText('authenticated:actor')
 await act(async () => screen.getByText('Logout').click())
 await screen.findByText('anonymous:')
 expect(localStorage.getItem('nexora:auth-change')).toBeTruthy()
 expect(sessionStorage.length).toBe(0)
})
it('another tab reacts to a logout notification by checking the shared cookie', async () => {
 vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(metadata))).mockResolvedValueOnce(new Response(null,{status:401})))
 render(<AuthProvider><Probe /></AuthProvider>)
 await screen.findByText('authenticated:actor')
 act(() => window.dispatchEvent(new StorageEvent('storage', {key:'nexora:auth-change',newValue:'logout'})))
 await screen.findByText('anonymous:')
})
it('restricted first-factor metadata never becomes authenticated access', async () => {
 vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({...metadata,next_step:'totp_verify'}))))
 render(<AuthProvider><Probe /></AuthProvider>)
 await screen.findByText('anonymous:actor')
 expect(sessionStore.current?.nextStep).toBe('totp_verify')
})
it('moves a legacy tab session into an HttpOnly cookie and removes its stored token', async () => {
 sessionStorage.setItem('nexora-session',JSON.stringify({accessToken:'nxs_legacy.secret'}))
 const fetcher=vi.fn().mockResolvedValueOnce(new Response(null,{status:401})).mockResolvedValueOnce(new Response(JSON.stringify(metadata)))
 vi.stubGlobal('fetch',fetcher)
 render(<AuthProvider><Probe /></AuthProvider>)
 await screen.findByText('authenticated:actor')
 expect(fetcher.mock.calls[1][1].method).toBe('POST')
 expect(fetcher.mock.calls[1][1].headers.get('Authorization')).toBe('Bearer nxs_legacy.secret')
 expect(sessionStorage.length).toBe(0)
})
it('uses cookies and a CSRF header for mutations rather than a bearer credential',async()=>{
 const fetcher=vi.fn().mockResolvedValue(new Response('{}'))
 vi.stubGlobal('fetch',fetcher)
 await apiFetch('/api/v1/projects',{method:'POST',body:'{}'})
 expect(fetcher.mock.calls[0][1].headers.get('X-Nexora-Browser')).toBe(window.location.origin)
 expect(fetcher.mock.calls[0][1].headers.has('Authorization')).toBe(false)
 expect(fetcher.mock.calls[0][1].credentials).toBe('same-origin')
})
it('rejects bearer credentials accidentally included in browser metadata',()=>{
 expect(()=>parseBrowserSession({...metadata,access_token:'nxs_secret'})).toThrow('invalid-session')
})
it('keeps the shared cookie identity instead of replacing it with an older tab credential', async()=>{
 sessionStorage.setItem('nexora-session',JSON.stringify({accessToken:'nxs_old.secret'}))
 const fetcher=vi.fn().mockResolvedValue(new Response(JSON.stringify({...metadata,actor_id:'new-account'})))
 vi.stubGlobal('fetch',fetcher)
 render(<AuthProvider><Probe /></AuthProvider>)
 await screen.findByText('authenticated:new-account')
 expect(fetcher).toHaveBeenCalledTimes(1)
 expect(sessionStorage.length).toBe(0)
})
