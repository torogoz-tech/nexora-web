import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import { WorkspacePermissionsContext } from '../src/app/WorkspacePermissionsContext'
import AssignRepositoryAnalysisProfileModal from '../src/components/AssignRepositoryAnalysisProfileModal'
import RepositoryAnalysisProfileSelection from '../src/components/RepositoryAnalysisProfileSelection'
const profile = { id: 'apv_1', key: 'web', version: '1.0.0', name: 'Web profile', language_id: 'typescript', checksum: 'a'.repeat(64), created_at: '2026-11-08T12:00:00Z' }
const second = { ...profile, id: 'apv_2', key: 'css', name: 'CSS profile', language_id: 'css' }
vi.mock('../src/hooks/useWorkCatalog', () => ({ useWorkCatalog: () => ({ items: [profile, second], loading: false, error: null, reload: vi.fn() }) }))
vi.mock('../src/hooks/useIntegrationMutation', () => ({ useIntegrationMutation: () => ({ busy: false, error: null, run: vi.fn() }) }))
const admin = { actor_id: 'admin', role: 'super_admin' as const, grants: [{ capability: 'installation:manage', project_id: null }] }
it('shows multiple independently checked versions, searchable catalog and bounded list in manual mode', () => {
 const html = renderToStaticMarkup(createElement(WorkspacePermissionsContext, { value: admin }, createElement(AssignRepositoryAnalysisProfileModal, { projectId: 'p', repositoryId: 'r', assignment: { repository_id: 'r', revision: 1, can_manage: true, mode: 'manual', profile, profiles: [profile, second], last_selection: null }, onClose: vi.fn(), onSaved: vi.fn() })))
 expect(html).toContain('Buscar perfiles de análisis')
 expect(html.match(/type="checkbox"/g)).toHaveLength(2)
 expect(html.match(/checked=""/g)).toHaveLength(2)
 expect(html).toContain('max-h-64')
 expect(html).toContain('Web profile')
 expect(html).toContain('CSS profile')
 expect(html).not.toContain('<select')
})
it('describes automatic versions without displaying a misleading manually pinned catalog', () => {
 const html = renderToStaticMarkup(createElement(WorkspacePermissionsContext, { value: admin }, createElement(AssignRepositoryAnalysisProfileModal, { projectId: 'p', repositoryId: 'r', assignment: { repository_id: 'r', revision: 0, can_manage: true, mode: 'automatic', profile: null, profiles: [], last_selection: null }, onClose: vi.fn(), onSaved: vi.fn() })))
 expect(html).toContain('Cada archivo se analiza una sola vez')
 expect(html).not.toContain('type="checkbox"')
})
it('does not offer selectable catalog entries or enabled save to unauthorized readers', () => {
 const html = renderToStaticMarkup(createElement(AssignRepositoryAnalysisProfileModal, { projectId: 'p', repositoryId: 'r', assignment: { repository_id: 'r', revision: 0, can_manage: false, mode: 'manual', profile, profiles: [profile], last_selection: null }, onClose: vi.fn(), onSaved: vi.fn() }))
 expect(html).toContain('No tienes permiso')
 expect(html).not.toContain('type="checkbox"')
 expect(html).toMatch(/<button[^>]*type="submit"[^>]*disabled=""/)
})
it('keeps only profile summaries and counts on the repository profile',()=>{
 const html=renderToStaticMarkup(createElement(RepositoryAnalysisProfileSelection,{report:{policy:'automatic-latest/v1',profiles:[{...profile,files:['src/index.ts']}],uncovered_files:['README.md'],excluded_files:['secret.bin']}}))
 expect(html).toContain('Web profile');expect(html).toContain('Archivos sin perfil compatible');expect(html).not.toContain('src/index.ts');expect(html).not.toContain('<details')
})
it('describes completed analysis observations without embedding file contents or raw diagnostics',()=>{
 const html=renderToStaticMarkup(createElement(RepositoryAnalysisProfileSelection,{report:{policy:'automatic-latest/v1',status:'partial',profiles:[],uncovered_files:[],excluded_files:[],skipped_files:[{path:'Controllers/Legacy.cs',profile_id:profile.id,reason:'invalid UTF-8',checksum:'b'.repeat(64)}]}}))
 expect(html).toContain('Finalizado con observaciones');expect(html).not.toContain('Controllers/Legacy.cs');expect(html).not.toContain('<details')
})
