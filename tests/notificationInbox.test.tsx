// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import { parseNotificationInbox } from '../src/utils/parseNotificationInbox'
import NotificationInbox from '../src/components/NotificationInbox'
const reload = vi.fn()
const write = vi.fn(async () => ({}))
vi.mock('../src/hooks/useApiData', () => ({ useApiData: () => ({ data: { items: [{ id: 'n1', kind: 'assignment', title: 'Nueva tarea', body: 'Revisa el servicio de pagos.', url: '/tasks/t1', created_at: '2026-11-09T12:00:00Z', read_at: null, archived_at: null }], total: 1, unread_count: 1 }, reload, loading: false, error: null }) }))
vi.mock('../src/services/writeGeneralSettings', () => ({ writeGeneralSettings: (...args: unknown[]) => write(...args as []) }))
afterEach(() => { cleanup(); vi.clearAllMocks() })
it('opens a message, marks it read and links to its resource without leaving placeholder content', async () => {
  const changed = vi.fn()
  render(<MemoryRouter><NotificationInbox onChanged={changed}/></MemoryRouter>)
  fireEvent.click(screen.getByRole('button', { name: /Nueva tarea/ }))
  await waitFor(() => expect(write).toHaveBeenCalledWith('/api/v1/notifications/n1', 'PATCH', { read: true }, expect.any(AbortSignal), expect.any(String)))
  expect(screen.getByRole('link', { name: /Abrir elemento/ }).getAttribute('href')).toBe('/tasks/t1')
  expect(changed).toHaveBeenCalledOnce()
  fireEvent.click(screen.getByRole('button', { name: 'Archivar notificación' }))
  await waitFor(() => expect(write).toHaveBeenCalledWith('/api/v1/notifications/n1', 'PATCH', { archived: true }, expect.any(AbortSignal), expect.any(String)))
})
it('only accepts local notification links and validates inbox envelopes', () => {
  const data = parseNotificationInbox({ total: 1, unread_count: 1, items: [{ id: 'n1', title: 't', body: 'b', created_at: '2026-11-09', url: '//external.invalid' }] })
  expect(data.items[0]?.url).toBeNull()
  expect(() => parseNotificationInbox({ items: [] })).toThrow()
})
it('refreshes the personal inbox for notification events independently of the current project', async () => {
  const { matchesLiveUpdate } = await import('../src/utils/matchesLiveUpdate')
  expect(matchesLiveUpdate('/api/v1/notifications?folder=unread', { projectId: null, topics: ['notifications'] })).toBe(true)
  expect(matchesLiveUpdate('/api/v1/notifications?folder=inbox', { projectId: 'prj', topics: ['notifications'] })).toBe(true)
  expect(matchesLiveUpdate('/api/v1/projects/prj/tasks', { projectId: null, topics: ['notifications'] })).toBe(false)
})
