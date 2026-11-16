// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { readApiJson } from '../services/readApiJson'
import { useApiData } from './useApiData'
vi.mock('../services/readApiJson', () => ({ readApiJson: vi.fn() }))
const parse = (value: unknown) => String(value)
afterEach(() => { cleanup(); vi.resetAllMocks() })
it('keeps the current resource visible during reload and keeps reload stable', async () => {
 let finish!: (value: unknown) => void
 vi.mocked(readApiJson).mockResolvedValueOnce('original').mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
 const { result } = renderHook(() => useApiData('/api/v1/repository', parse))
 await waitFor(() => expect(result.current.data).toBe('original'))
 const reload = result.current.reload
 act(() => reload())
 expect(result.current.data).toBe('original')
 expect(result.current.loading).toBe(false)
 expect(result.current.reload).toBe(reload)
 await act(async () => finish('updated'))
 expect(result.current.data).toBe('updated')
})
it('never shows a previous resource while changing routes', async () => {
 vi.mocked(readApiJson).mockResolvedValueOnce('private resource').mockImplementationOnce(() => new Promise(() => {}))
 const { result, rerender } = renderHook(({path}) => useApiData(path, parse), {initialProps:{path:'/api/v1/first'}})
 await waitFor(() => expect(result.current.data).toBe('private resource'))
 rerender({path:'/api/v1/second'})
 expect(result.current.data).toBeNull()
 expect(result.current.loading).toBe(true)
})
it('clears previously loaded data when refreshed access is denied', async () => {
 vi.mocked(readApiJson).mockResolvedValueOnce('private resource').mockRejectedValueOnce(new Error('Forbidden'))
 const {result} = renderHook(() => useApiData('/api/v1/repository',parse))
 await waitFor(() => expect(result.current.data).toBe('private resource'))
 act(() => result.current.reload())
 await waitFor(() => expect(result.current.error).toBe('Forbidden'))
 expect(result.current.data).toBeNull()
})

it('keeps the mounted resource during temporary network failures and recovers silently', async () => {
 vi.mocked(readApiJson).mockResolvedValueOnce('profile').mockRejectedValueOnce(new TypeError('Failed to fetch')).mockResolvedValueOnce('updated profile')
 const {result} = renderHook(() => useApiData('/api/v1/members/me/profile',parse))
 await waitFor(() => expect(result.current.data).toBe('profile'))
 act(() => result.current.reload())
 await waitFor(() => expect(result.current.error).toBeTruthy())
 expect(result.current.data).toBe('profile')
 expect(result.current.loading).toBe(false)
 act(() => result.current.reload())
 await waitFor(() => expect(result.current.data).toBe('updated profile'))
 expect(result.current.error).toBeNull()
})
