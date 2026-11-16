import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect, it } from 'vitest'
import ProfileActivityFeed from '../src/components/ProfileActivityFeed'
import type { ProfileActivityAuthor } from '../src/types/ProfileActivityAuthor'

const render = (author: ProfileActivityAuthor) => renderToStaticMarkup(<MemoryRouter><ProfileActivityFeed projectName={() => 'Project'} events={[{ id: 'commit', project_id: 'project', kind: 'commit', title: 'Change', created_at: '2026-01-01T00:00:00Z', author }]}/></MemoryRouter>)

it('links the commit author avatar and public name to their member profile with their position', () => {
  const html = render({ id: 'member/one', name: 'Ana', position: 'Technical lead', avatar_revision: 2 })
  expect(html).toContain('href="/settings/members/member%2Fone"')
  expect(html).toContain('Avatar de Ana')
  expect(html).toContain('Technical lead')
})

it('preserves unmatched Git author identity without inventing a public profile', () => {
  const html = render({ id: null, name: 'Git contributor', position: '', avatar_revision: 0 })
  expect(html).toContain('Git contributor')
  expect(html).not.toContain('/settings/members/')
})
