import { describe, expect, it, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { parseProjectProfile } from '../utils/parseProjectProfile'
import ProjectProfilePage from '../pages/ProjectProfilePage'
import { LocaleContext } from '../app/LocaleContext'
import { translate } from '../i18n/translate'
import { useApiData } from '../hooks/useApiData'

vi.mock('../hooks/useApiData', () => ({ useApiData: vi.fn() }))

describe('project profile contract and presentation', () => {
  const fixture = {
    project: { id: 'project-1', name: 'Codelo', description: 'Conocimiento compartido', archived: false, revision: 2, created_at: '2026-02-01T12:00:00Z', internal_key: 'private-project-key' },
    members: [{ id: 'member-1', name: 'Ana Pérez', username: 'ana', role: 'developer', avatar_revision: 7, email: 'private@example.test', has_password: true, role_project_ids: ['hidden-project'] }],
    repositories: [{ id: 'repository-1', project_id: 'project-1', name: 'Codelo API', provider: 'github', status: 'authorized', remote_url: 'private-provider-url', credential: 'private-credential' }],
    priority_tasks: [{ id: 'task-1', project_id: 'project-1', title: 'Corregir permisos', priority: 'critical' }],
    counts: { tasks: 12, documents: 3, requirements: 2, features: 1 },
    contributions: [{ date: '2026-03-01', count: 2 }],
    activity: [{ id: 'event-1', project_id: 'project-1', kind: 'document', title: 'Guía del proyecto', created_at: '2026-03-01T12:00:00Z', actor_email: 'hidden@example.test' }],
    year: 2026,
  }

  it('retains public project data while stripping private metadata at every level', () => {
    const data = parseProjectProfile(fixture)
    expect(data.project.name).toBe('Codelo')
    expect(data.counts).toEqual({ tasks: 12, documents: 3, requirements: 2, features: 1 })
    expect(data.members).toEqual([{ id: 'member-1', name: 'Ana Pérez', username: 'ana', position: '', role: 'developer', avatar_revision: 7 }])
    const serialized = JSON.stringify(data)
    for (const forbidden of ['internal_key', 'email', 'has_password', 'role_project_ids', 'remote_url', 'credential', 'actor_email']) expect(serialized).not.toContain(forbidden)
  })

  it.each([-1, 0.5, Number.MAX_SAFE_INTEGER + 1, '10', null])('rejects unsafe counts: %s', count => {
    expect(() => parseProjectProfile({ ...fixture, counts: { ...fixture.counts, tasks: count } })).toThrow()
  })

  it('rejects out-of-project records and unsupported members, tasks and activity', () => {
    expect(() => parseProjectProfile({ ...fixture, repositories: [{ ...fixture.repositories[0], project_id: 'hidden-project' }] })).toThrow()
    expect(() => parseProjectProfile({ ...fixture, members: [{ ...fixture.members[0], role: 'owner' }] })).toThrow()
    expect(() => parseProjectProfile({ ...fixture, priority_tasks: [{ ...fixture.priority_tasks[0], priority: 'low' }] })).toThrow()
    expect(() => parseProjectProfile({ ...fixture, activity: [{ ...fixture.activity[0], kind: 'secret' }] })).toThrow()
    expect(() => parseProjectProfile({ ...fixture, project: { ...fixture.project, created_at: 'invalid' } })).toThrow()
  })

  it('rejects impossible, duplicate and out-of-year contribution dates', () => {
    for (const date of ['2026-02-30', '2025-03-01', 'invalid']) expect(() => parseProjectProfile({ ...fixture, contributions: [{ date, count: 1 }] })).toThrow()
    expect(() => parseProjectProfile({ ...fixture, contributions: [fixture.contributions[0], fixture.contributions[0]] })).toThrow()
  })

  it('renders real metrics, registered-repository navigation and the shared contribution calendar without privileged member actions', () => {
    vi.mocked(useApiData).mockReturnValue({ data: parseProjectProfile(fixture), loading: false, error: null, reload: vi.fn() })
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={['/projects/project-1?year=2026']}><ProjectProfilePage projectId="project-1" /></MemoryRouter>)
    expect(useApiData).toHaveBeenCalledWith('/api/v1/projects/project-1/profile?year=2026', parseProjectProfile)
    expect(html).toContain('Codelo')
    expect(html).toContain('href="/code/repositories/project-1/repository-1"')
    expect(html).toContain('href="/settings/projects"')
    expect(html).toContain('Ana Pérez')
    expect(html).toContain('Corregir permisos')
    expect(html).toContain('Guía del proyecto')
    expect(html).toContain('2 contribuciones en 2026')
    expect(html).toContain('role="combobox"')
    expect(html).not.toContain('<select')
    expect(html).not.toContain('<img')
    expect(html).toContain('href="/settings/members/')
    expect(html).not.toContain('Configurar rol')
    expect(html).not.toContain('Editar posición')
    expect(html).not.toContain('private@example.test')
    expect(html).not.toContain('href="/tasks')
  })

  it('preserves true empty and zero states and translates the project-specific copy', () => {
    const empty = parseProjectProfile({ ...fixture, project: { ...fixture.project, archived: true, description: null }, counts: { tasks: 0, documents: 0, requirements: 0, features: 0 }, repositories: [], members: [], priority_tasks: [], contributions: [], activity: [] })
    vi.mocked(useApiData).mockReturnValue({ data: empty, loading: false, error: null, reload: vi.fn() })
    const html = renderToStaticMarkup(<LocaleContext.Provider value={{ language: 'en', dateLocale: 'en-US', t: (source, params) => translate('en', source, params), applyPreferences: () => {} }}><MemoryRouter initialEntries={['/projects/project-1?year=2026']}><ProjectProfilePage projectId="project-1" /></MemoryRouter></LocaleContext.Provider>)
    expect(html).toContain('Project overview')
    expect(html).not.toContain('No project description.')
    expect(html).toContain('There are no members to display.')
    expect(html).toContain('There is no recorded activity in this project yet.')
    expect(html).toContain('0 contributions in 2026')
    expect(html).not.toContain('href="/code/repositories/')
  })

  it('renders permission errors as retryable data messages without rendering project content', () => {
    vi.mocked(useApiData).mockReturnValue({ data: null, loading: false, error: 'No tienes permisos para realizar esta acción.', reload: vi.fn() })
    const html = renderToStaticMarkup(<MemoryRouter><ProjectProfilePage projectId="project-1" /></MemoryRouter>)
    expect(html).toContain('No tienes permisos para realizar esta acción.')
    expect(html).not.toContain('Codelo API')
    expect(html).not.toContain('profile-contributions-title')
  })
})
