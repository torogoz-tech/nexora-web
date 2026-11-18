import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import RequestsContextNavigation from '../components/RequestsContextNavigation'
import ServiceRequestsPage from '../pages/ServiceRequestsPage'
import { navigation } from '../app/navigation'
import { canOpenWorkspacePath } from '../utils/canOpenWorkspacePath'
import { parseEffectivePermissions } from '../utils/parseEffectivePermissions'
const paths = vi.hoisted(() => [] as string[])
vi.mock('../hooks/useApiData', () => ({ useApiData: (path: string) => {
  paths.push(path)
  return { data: path.endsWith('/types') ? { items: [{ id: 'support', name: 'Soporte', archived: false, total: 3 }, { id: 'old', name: 'Anterior', archived: true, total: 0 }] } : { items: [], total: 0 }, loading: false, error: null, reload: () => {} }
} }))
describe('request navigation', () => {
  it('places member onboarding only in Settings and keeps member roles in Requests', () => {
    expect(navigation.find(area => area.id === 'requests')?.items.map(item => item.path)).toEqual(['/requests','/requests/reports','/settings/members'])
    expect(navigation.find(area => area.id === 'settings')?.items.some(item => item.path === '/settings/member-requests')).toBe(true)
    expect(navigation.find(area => area.id === 'settings')?.items.some(item => item.path === '/settings/request-types')).toBe(true)
    for (const role of ['user', 'supervisor', 'developer']) expect(canOpenWorkspacePath('/settings/request-types', parseEffectivePermissions({ actor_id: 'a', role, grants: [] }))).toBe(false)
    expect(canOpenWorkspacePath('/settings/request-types', parseEffectivePermissions({ actor_id: 'a', role: 'manager', grants: [] }))).toBe(true)
  })
  it('nests type filters, preserves search and resets pagination', () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={['/requests?type=support&page=4&search=printer']}><RequestsContextNavigation onClose={() => {}}/></MemoryRouter>)
    expect(html).toContain('aria-current="page"')
    expect(html).toContain('/requests?type=support&amp;search=printer')
    expect(html).not.toContain('page=4')
    expect(html).not.toContain('Anterior')
    expect(html).not.toContain('/requests/types')
  })
  it('sends the selected type to the backend instead of hiding page items', () => {
    renderToStaticMarkup(<MemoryRouter initialEntries={['/requests?type=support&product=prd_portal&page=2']}><ServiceRequestsPage/></MemoryRouter>)
    expect(paths.some(path => path.includes('type_id=support') && path.includes('product_id=prd_portal') && path.includes('page=2'))).toBe(true)
  })
})
