// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import AuthProvider from '../src/app/AuthProvider'
import { useAuth } from '../src/hooks/useAuth'
import { readBrowserSession } from '../src/services/readBrowserSession'
vi.mock('../src/services/readBrowserSession', () => ({ readBrowserSession: vi.fn() }))
afterEach(() => { cleanup(); vi.resetAllMocks() })
it('keeps the workspace mounted when a focus session refresh fails temporarily, but clears a revoked session', async () => {
 const session = { actorId: 'person', sessionId: 'session', expiresAt: Date.now() + 60000 }
 vi.mocked(readBrowserSession).mockResolvedValueOnce(session).mockRejectedValueOnce(new TypeError('offline')).mockResolvedValueOnce(null)
 const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
 await waitFor(() => expect(result.current.status).toBe('authenticated'))
 await act(async () => { window.dispatchEvent(new Event('focus')) })
 await waitFor(() => expect(readBrowserSession).toHaveBeenCalledTimes(2))
 expect(result.current.status).toBe('authenticated')
 expect(result.current.session?.actorId).toBe('person')
 await act(async () => { window.dispatchEvent(new Event('focus')) })
 await waitFor(() => expect(result.current.status).toBe('anonymous'))
 expect(result.current.session).toBeNull()
})
it('does not grant access when initial session verification is unavailable', async () => {
 vi.mocked(readBrowserSession).mockRejectedValue(new TypeError('offline'))
 const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider })
 await waitFor(() => expect(result.current.status).toBe('unavailable'))
 expect(result.current.session).toBeNull()
})
