// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import NotificationsButton from '../src/components/NotificationsButton'
import NotificationInboxPage from '../src/pages/NotificationInboxPage'
import { canOpenWorkspacePath } from '../src/utils/canOpenWorkspacePath'
vi.mock('../src/hooks/useLiveUpdates', () => ({ useLiveUpdates: vi.fn() }))
vi.mock('../src/hooks/useApiData', () => ({ useApiData: () => ({ data: { items: [], total: 0, unread_count: 2 }, reload: vi.fn(), loading: false, error: null }) }))
afterEach(cleanup)
it('opens the personal inbox with a real page link instead of a modal', () => {
 render(<MemoryRouter><NotificationsButton /></MemoryRouter>)
 expect(screen.getByRole('link', { name: 'Notificaciones, 2 sin leer' }).getAttribute('href')).toBe('/notifications')
 expect(document.querySelector('dialog')).toBeNull()
 expect(document.querySelector('.rounded-full.bg-red-400')).toBeTruthy()
 expect(screen.queryByText('2')).toBeNull()
 expect(canOpenWorkspacePath('/notifications', { actor_id: 'dev', role: 'developer', grants: [] })).toBe(true)
})
it('renders mailbox folders on a full-height page without dialog close controls', () => {
 render(<MemoryRouter><NotificationInboxPage /></MemoryRouter>)
 expect(screen.getByRole('heading', { name: 'Notificaciones', level: 1 })).toBeTruthy()
 expect(screen.getByRole('navigation', { name: 'Carpetas de notificaciones' })).toBeTruthy()
 expect(document.querySelector('.modal-box')).toBeNull()
 expect(screen.queryByRole('button', { name: 'Cerrar notificaciones' })).toBeNull()
})
