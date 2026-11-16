import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import DeveloperRatings from '../components/DeveloperRatings'
const state = vi.hoisted(() => ({ data: { actor_id: 'developer', year: 2026, annual: 0 as number | null, can_rate: false, weekly: [], monthly: [], daily: [{ date: '2026-11-06', excluded: false, push: false, score: 0, entries: [] }] } }))
vi.mock('../hooks/useApiData', () => ({ useApiData: () => ({ data: state.data, error: null, loading: false, reload: vi.fn() }) }))
it('shows a true zero and hides the rating action when the server forbids it', () => {
  const html = renderToStaticMarkup(createElement(DeveloperRatings, { actorId: 'developer', year: 2026, projects: [] }))
  expect(html).toContain('0 / 5')
  expect(html).not.toContain('aria-label="Valorar trabajo"')
})
it('distinguishes unrated annual totals and exposes only authorized rating actions', () => {
  state.data.annual = null
  state.data.can_rate = true
  const html = renderToStaticMarkup(createElement(DeveloperRatings, { actorId: 'developer', year: 2026, projects: [{ id: 'p1', name: 'Shared project' }] }))
  expect(html).toContain('Sin calificación')
})
