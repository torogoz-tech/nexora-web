import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, expect, it, vi } from 'vitest'
import { navigation } from '../app/navigation'
import { WorkspaceNavigationContext } from '../app/WorkspaceNavigationContext'
import { WorkNavigationContext } from '../app/WorkNavigationContext'
import type { WorkNavigationValue } from '../types/WorkNavigationValue'
import { workspaceNavigationForRole } from '../utils/workspaceNavigationForRole'
import { parseNavigationRole } from '../utils/parseNavigationRole'
import { useNavigation } from '../hooks/useNavigation'
import WorkContextNavigation from '../components/WorkContextNavigation'
import AppLayout from '../layouts/AppLayout'
vi.mock('../layouts/PrimaryNavigation', () => ({ default: () => <aside>Primary</aside> }))
vi.mock('../layouts/ContextSidebar', () => ({ default: () => <nav>Context</nav> }))
const state: WorkNavigationValue = { types: { items: [{ code: 'bug', name: 'Errores', total: 2, color: null }], total: 7, loading: false, error: null, reload: () => {} }, workflows: { items: [{ id: 'delivery', name: 'Desarrollo', purpose: 'Entrega', resource_kinds: ['task'], archived: false, revision: 1, latest_version_id: 'v1', latest_version_number: 1 }], total: 1, loading: false, error: null, reload: () => {} } }
function ActiveArea() { const active = useNavigation(); return <span>{active.id}:{active.label}</span> }
describe('unified work navigation', () => {
  it('groups the five existing routes under one primary menu', () => {
    const work = navigation.find(item => item.id === 'work')!
    expect(work.items.map(item => item.path)).toEqual(['/tasks', '/boards', '/calendar', '/ratings', '/team/projects', '/team/members', '/settings/labor-calendar', '/settings/products', '/approvals', '/overtime'])
    expect(navigation.filter(item => ['tasks', 'boards', 'calendar', 'ratings', 'overtime'].includes(item.id))).toEqual([])
    for (const path of ['/tasks', '/boards/delivery', '/calendar', '/ratings', '/team/projects', '/team/members', '/settings/labor-calendar', '/settings/products', '/approvals', '/overtime']) {
      expect(renderToStaticMarkup(<MemoryRouter initialEntries={[path]}><ActiveArea/></MemoryRouter>)).toContain('work:Mi trabajo')
    }
  })
  it('uses Team for PMO and managers without changing routes or permissions', () => {
    for (const role of ['pmo', 'manager'] as const) expect(workspaceNavigationForRole(role).find(item=>item.id==='work')?.label).toBe('Equipo')
    expect(workspaceNavigationForRole('developer').find(item=>item.id==='work')?.label).toBe('Mi trabajo')
    expect(parseNavigationRole({ member: { role: 'unknown' } })).toBeNull()
    expect(renderToStaticMarkup(<WorkspaceNavigationContext value={workspaceNavigationForRole('pmo')}><MemoryRouter initialEntries={['/overtime']}><ActiveArea/></MemoryRouter></WorkspaceNavigationContext>)).toContain('work:Equipo')
  })
  it('preserves task type counts and the five shared links', () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={['/tasks?type=bug']}><WorkNavigationContext value={state}><WorkContextNavigation onClose={() => {}}/></WorkNavigationContext></MemoryRouter>)
    expect(html).toContain('Errores')
    expect(html).toContain('type=bug')
    expect(html).toContain('>7</span>')
    for (const path of ['/tasks', '/boards', '/calendar', '/ratings', '/team/projects', '/team/members', '/settings/labor-calendar', '/settings/products', '/approvals', '/overtime']) expect(html).toContain(`href="${path}"`)
  })
  it('shows the workflow submenu even with a single workflow', () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={['/boards/delivery']}><WorkNavigationContext value={state}><WorkContextNavigation onClose={() => {}}/></WorkNavigationContext></MemoryRouter>)
    expect(html).toContain('Desarrollo')
    expect(html).toContain('href="/boards/delivery"')
    const layout = renderToStaticMarkup(<MemoryRouter initialEntries={['/boards/delivery']}><AppLayout active={navigation.find(item=>item.id==='work')!}>Kanban</AppLayout></MemoryRouter>)
    expect(layout).toContain('id="context-sidebar"')
    expect(layout).not.toContain('nexora-shell--without-context')
    expect(layout).not.toContain('max-w-')
  })
})
