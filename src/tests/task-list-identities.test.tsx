import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import TaskCreatorIdentity from '../components/TaskCreatorIdentity'
const request = vi.hoisted(() => vi.fn(() => ({ data: null, loading: false })))
vi.mock('../hooks/useApiData', () => ({ useApiData: request }))
vi.mock('../hooks/useAuth', () => ({ useAuth: () => ({ session: null }) }))
describe('task list identity presentation', () => {
 it('uses the embedded identity without requesting a member profile', () => {
  const markup = renderToStaticMarkup(<MemoryRouter><TaskCreatorIdentity actorId="person" resolveProfile={false} creator={{id:'person',name:'Diego',position:'Líder Técnico',avatar_revision:2}}/></MemoryRouter>)
  expect(request).toHaveBeenCalledWith(null, expect.any(Function))
  expect(markup).toContain('Diego')
  expect(markup).toContain('Líder Técnico')
  expect(markup).toContain('/settings/members/person')
 })
})
