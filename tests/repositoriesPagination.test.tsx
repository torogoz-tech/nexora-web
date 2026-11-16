import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import RepositoriesPage from '../src/pages/RepositoriesPage'
vi.mock('../src/hooks/useGitAccounts', () => ({ useGitAccounts: () => ({ accounts: [{ id: 'connection', status: 'active', provider: 'github', remote_login: 'team' }], loading: false, error: null }) }))
vi.mock('../src/hooks/useRepositoryCatalog', () => ({ useRepositoryCatalog: () => ({ items: Array.from({ length: 21 }, (_, i) => ({ provider: 'github', remote_id: `${i}`, full_name: `team/repo${i}` })), loading: false, error: null }) }))
it('places repository pagination above the catalog', () => {
  const html = renderToStaticMarkup(<MemoryRouter><RepositoriesPage/></MemoryRouter>)
  expect(html.indexOf('aria-label="Paginación"')).toBeGreaterThan(-1)
  expect(html.indexOf('aria-label="Paginación"')).toBeLessThan(html.indexOf('<ul'))
  expect(html).toContain('20 en esta página · 21 en total')
})
