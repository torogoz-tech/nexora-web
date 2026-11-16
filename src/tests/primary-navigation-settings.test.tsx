// @vitest-environment jsdom
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import { afterEach, expect, it, vi } from 'vitest'
import PrimaryNavigation from '../layouts/PrimaryNavigation'
import { navigation } from '../app/navigation'
import { orderSettingsNavigation } from '../utils/orderSettingsNavigation'
vi.mock('../components/OrganizationMark', () => ({ default: () => <span>N</span> }))
vi.mock('../components/UserMenu', () => ({ default: () => <button>Usuario</button> }))
vi.mock('../components/NotificationsButton', () => ({ default: () => <a href="/notifications">Campana</a> }))
afterEach(cleanup)
it('puts the active settings gear between the notification bell and the avatar, outside main areas', () => {
  render(<MemoryRouter><PrimaryNavigation activeId="settings" showContextToggle={false} sidebarOpen={false} onToggleSidebar={() => {}} /></MemoryRouter>)
  expect(within(screen.getByRole('navigation', { name: 'Áreas de Nexora' })).queryByRole('link', { name: 'Configuración' })).toBeNull()
  const settings = screen.getByRole('link', { name: 'Configuración' })
  expect(settings.getAttribute('aria-current')).toBe('page')
  expect(settings.querySelector('.lucide-settings')).toBeTruthy()
  expect(settings.previousElementSibling?.textContent).toBe('Campana')
  expect(settings.nextElementSibling?.textContent).toBe('Usuario')
})
it('uses a logical default order while preserving the organization custom order', () => {
  const defaults = orderSettingsNavigation(navigation, []).find(area => area.id === 'settings')!.items
  expect(defaults.slice(0, 4).map(item => item.label)).toEqual(['General', 'Tipos de tareas', 'Workflows', 'Tipos de solicitudes'])
  const custom = orderSettingsNavigation(navigation, ['/settings/mcp', '/settings/openai']).find(area => area.id === 'settings')!.items
  expect(custom.slice(0, 2).map(item => item.path)).toEqual(['/settings/mcp', '/settings/openai'])
})
