// @vitest-environment jsdom
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it, vi } from 'vitest'
import MembersPage from '../src/pages/MembersPage'

vi.mock('../src/hooks/useApiData', () => ({
  useApiData: (path: string | null) => path === null || path?.includes('invitations')
    ? { data: [], loading: false, error: null, reload: vi.fn() }
    : { data: [{ id: 'member', name: 'Ana', username: 'ana', email: 'ana@example.com', active: true, archived: false, role: 'developer', position: 'Developer', position_revision: 1, lifecycle_revision: 1, avatar_revision: 0 }], loading: false, error: null, reload: vi.fn() },
}))
vi.mock('../src/app/WorkspacePermissionsContext', () => ({ WorkspacePermissionsContext: { _currentValue: null } }))
vi.mock('../src/components/UserAvatar', () => ({ default: () => createElement('span', null, 'Avatar') }))
vi.mock('../src/components/MemberWorkflowEditor', () => ({ default: () => null }))
vi.mock('../src/components/MemberPositionEditor', () => ({ default: () => null }))
vi.mock('../src/components/MemberRoleModal', () => ({ default: () => null }))
vi.mock('../src/components/MemberAccessMethods', () => ({ default: () => null }))
vi.mock('../src/components/MemberArchiveAction', () => ({ default: () => null }))

it('renders organization members as a structured table', () => {
  const html = renderToStaticMarkup(<MemoryRouter><MembersPage /></MemoryRouter>)
  expect(html).toContain('<table')
  expect(html).toContain('aria-label="Miembros e invitaciones"')
  expect(html).toContain('Ana')
  expect(html).toContain('ana@example.com')
})
