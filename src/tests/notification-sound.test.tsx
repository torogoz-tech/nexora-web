// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { useNotificationSound } from '../hooks/useNotificationSound'
import { playNotificationSound } from '../services/playNotificationSound'
import type { NotificationInboxPage } from '../types/NotificationInboxPage'
vi.mock('../services/playNotificationSound', () => ({ playNotificationSound: vi.fn() }))
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.clearAllMocks() })
function page(id: string, date: string, read = false): NotificationInboxPage {
  return { total: 1, unread_count: read ? 0 : 1, items: [{ id, created_at: date, read_at: read ? date : null, archived_at: null, title: id, body: '', kind: '', url: null }] }
}
it('sounds once for a new unread notification, never for initial data, reloads or older items', () => {
  const close = vi.fn().mockResolvedValue(undefined)
  vi.stubGlobal('AudioContext', class { state = 'running'; close = close })
  const { rerender } = renderHook(({ value }) => useNotificationSound(value), { initialProps: { value: page('old', '2026-11-14T10:00:00Z') } })
  act(() => window.dispatchEvent(new MouseEvent('click')))
  expect(playNotificationSound).not.toHaveBeenCalled()
  rerender({ value: page('new', '2026-11-14T11:00:00Z') })
  expect(playNotificationSound).toHaveBeenCalledTimes(1)
  rerender({ value: page('new', '2026-11-14T11:00:00Z') })
  rerender({ value: page('old', '2026-11-14T10:00:00Z') })
  rerender({ value: page('read', '2026-11-14T12:00:00Z', true) })
  expect(playNotificationSound).toHaveBeenCalledTimes(1)
})
it('keeps the visual flow working when audio is unavailable or not activated', () => {
  const { rerender } = renderHook(({ value }) => useNotificationSound(value), { initialProps: { value: page('old', '2026-11-14T10:00:00Z') } })
  act(() => window.dispatchEvent(new MouseEvent('click')))
  rerender({ value: page('new', '2026-11-14T11:00:00Z') })
  expect(playNotificationSound).not.toHaveBeenCalled()
})
