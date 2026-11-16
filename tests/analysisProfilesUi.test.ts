import {MemoryRouter} from 'react-router'
import { createElement } from 'react'
import { renderToStaticMarkup as renderMarkup } from 'react-dom/server'
const renderToStaticMarkup=(node:Parameters<typeof renderMarkup>[0])=>renderMarkup(createElement(MemoryRouter,null,node))
import { expect, it, vi } from 'vitest'
import { WorkspacePermissionsContext } from '../src/app/WorkspacePermissionsContext'
import RepositoryAnalysisProfile from '../src/components/RepositoryAnalysisProfile'
import { navigation } from '../src/app/navigation'
const state = vi.hoisted(() => ({ paths: [] as (string | null)[], assignment: { repository_id: 'repo', revision: 0, profile: null as null | { id: string; key: string; version: string; name: string; language_id: string; checksum: string; created_at: string }, can_manage: true } }))
vi.mock('../src/hooks/useApiData', () => ({ useApiData: (path: string | null) => { state.paths.push(path); return { data: state.assignment, loading: false, error: null, reload: vi.fn() } } }))
it('shows a safe managed-profile summary to repository readers without opening the administrative catalog', () => {
 state.paths = []
 state.assignment.profile = { id: 'apv', key: 'web', version: '1.0.0', name: 'Web profile', language_id: 'typescript', checksum: 'a'.repeat(64), created_at: '2026-11-08' }
 const html = renderToStaticMarkup(createElement(WorkspacePermissionsContext, { value: { actor_id: 'developer', role: 'developer', grants: [{ capability: 'repositories:read', project_id: 'project' }] } }, createElement(RepositoryAnalysisProfile, { projects: [{ id: 'project', repository_id: 'repo', name: 'Project' }], onChanged: vi.fn() })))
 expect(html).toContain('Web profile')
 expect(html).toContain('1.0.0')
 expect(html).not.toContain('aria-label="Asignar perfil de análisis"')
 expect(state.paths).toEqual(['/api/v1/projects/project/repositories/repo/analysis-profile'])
})
it('does not turn an absent managed assignment into a false unavailable-worker or disabled-sync claim', () => {
 state.assignment.profile = null
 const html = renderToStaticMarkup(createElement(RepositoryAnalysisProfile, { projects: [{ id: 'project', repository_id: 'repo', name: 'Project' }], onChanged: vi.fn() }))
 expect(html).toContain('Sin perfil gestionado asignado')
 expect(html).toContain('Puede existir una configuración del servidor')
 expect(html).not.toContain('worker no disponible')
 expect(html).not.toContain('disabled')
 expect(navigation.find(area => area.id === 'settings')?.items.some(item => item.path === '/settings/analysis-profiles')).toBe(true)
})
