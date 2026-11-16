import { afterEach, expect, it, vi } from 'vitest'
import { parseAnalysisProfileSummary } from '../src/utils/parseAnalysisProfileSummary'
import { parseAnalysisProfileAssignment } from '../src/utils/parseAnalysisProfileAssignment'
import { parseAnalysisProfilePage } from '../src/utils/parseAnalysisProfilePage'
import { readAnalysisProfileFile } from '../src/services/readAnalysisProfileFile'
import { importAnalysisProfile } from '../src/services/importAnalysisProfile'
import { downloadAnalysisProfile } from '../src/services/downloadAnalysisProfile'
import { parseAnalysisProfileDetail } from '../src/utils/parseAnalysisProfileDetail'
import { canManageAnalysisProfiles } from '../src/utils/canManageAnalysisProfiles'
import { exportAnalysisProfile } from '../src/services/exportAnalysisProfile'
import { assignRepositoryAnalysisProfile } from '../src/services/assignRepositoryAnalysisProfile'
afterEach(() => vi.unstubAllGlobals())
const fetcher = vi.hoisted(() => vi.fn())
vi.mock('../src/services/apiFetch', () => ({ apiFetch: fetcher }))
const summary = { id: 'apv_1', key: 'web', version: '1.0.0', name: 'Web', language_id: 'typescript', checksum: 'a'.repeat(64), created_at: '2026-11-08T12:00:00Z' }
const pack = { format: 'nexora.analysis-profile', schema_version: 1, key: 'web', version: '1.0.0', name: 'Web', language_id: 'typescript', models: [{ manifest: {}, lexer: {}, grammar: {}, graph: {} }] }
it('accepts immutable profile summaries but does not expose extra configuration or paths', () => {
 expect(parseAnalysisProfileSummary({ ...summary, directory: '/etc/private', token: 'secret' })).toEqual(summary)
 expect(parseAnalysisProfilePage({ items: [summary], next_after: null }).items).toHaveLength(1)
 expect(() => parseAnalysisProfileSummary({ ...summary, checksum: 'not-a-fingerprint' })).toThrow()
 expect(() => parseAnalysisProfilePage({ items: [summary], next_after: 1 })).toThrow()
})
it('preserves a missing managed assignment without inventing a legacy or inferred model', () => {
 expect(parseAnalysisProfileAssignment({ repository_id: 'repo', revision: 0, profile: null, can_manage: false })).toEqual({ repository_id: 'repo', revision: 0, profile: null, can_manage: false, mode: 'legacy', profiles: [], last_selection: null })
 expect(() => parseAnalysisProfileAssignment({ repository_id: 'repo', revision: -1, profile: null, can_manage: true })).toThrow()
 expect(() => parseAnalysisProfileAssignment({ repository_id: 'repo', revision: 1, profile: summary, can_manage: 'yes' })).toThrow()
})
it('reads a bounded portable JSON file, leaving semantic model validation to the server', async () => {
 expect(await readAnalysisProfileFile(new File([JSON.stringify(pack)], 'web.nexora-profile.json'))).toEqual(pack)
 await expect(readAnalysisProfileFile(new File(['not JSON'], 'broken.json'))).rejects.toThrow()
 await expect(readAnalysisProfileFile(new File([JSON.stringify({ ...pack, format: 'unrelated' })], 'other.json'))).rejects.toThrow()
 await expect(readAnalysisProfileFile({ size: 16 * 1024 * 1024 + 1, text: vi.fn() } as unknown as File)).rejects.toThrow()
})
it('imports the entire portable package and keeps retries tied to the idempotency key', async () => {
 fetcher.mockResolvedValueOnce(Response.json(summary))
 const signal = new AbortController().signal
 expect(await importAnalysisProfile(pack, 'import-key', signal)).toEqual(summary)
 const [path, init] = fetcher.mock.calls.at(-1)!
 expect(path).toBe('/api/v1/analysis-profiles')
 expect(init.headers['Idempotency-Key']).toBe('import-key')
 expect(JSON.parse(init.body)).toEqual(pack)
 fetcher.mockResolvedValueOnce(Response.json({}, { status: 409 }))
 await expect(importAnalysisProfile(pack, 'import-key', signal)).rejects.toThrow('versión')
 fetcher.mockResolvedValueOnce(Response.json({ ...summary, version: '2.0.0' }))
 await expect(importAnalysisProfile(pack, 'wrong-response-key', signal)).rejects.toThrow('no corresponde')
})
it('changes and removes only an explicit repository assignment using its current revision', async () => {
 const result = { repository_id: 'repo', revision: 4, profile: summary, can_manage: true }
 fetcher.mockResolvedValueOnce(Response.json(result))
 const signal = new AbortController().signal
 expect(await assignRepositoryAnalysisProfile('project', 'repo', 3, summary.id, 'assignment-key', signal)).toEqual({ ...result, mode: 'manual', profiles: [summary], last_selection: null })
 const [path, init] = fetcher.mock.calls.at(-1)!
 expect(path).toBe('/api/v1/projects/project/repositories/repo/analysis-profile')
 expect(init.method).toBe('PUT')
 expect(init.headers['Idempotency-Key']).toBe('assignment-key')
 expect(JSON.parse(init.body)).toEqual({ expected_revision: 3, profile_version_id: summary.id, reason: 'Perfil de análisis asignado desde la web.' })
 fetcher.mockResolvedValueOnce(Response.json({ ...result, revision: 5, profile: null }))
 await assignRepositoryAnalysisProfile('project', 'repo', 4, null, 'remove-key', signal)
 expect(JSON.parse(fetcher.mock.calls.at(-1)![1].body).profile_version_id).toBeNull()
 fetcher.mockResolvedValueOnce(Response.json({}, { status: 409 }))
 await expect(assignRepositoryAnalysisProfile('project', 'repo', 4, null, 'remove-key', signal)).rejects.toThrow('cambió')
})

it('rejects mixed version details and scopes administration to a global installation grant', () => {
 expect(parseAnalysisProfileDetail({ ...summary, package: pack }).package).toEqual(pack)
 expect(() => parseAnalysisProfileDetail({ ...summary, package: { ...pack, version: '2.0.0' } })).toThrow()
 expect(canManageAnalysisProfiles(null)).toBe(false)
 expect(canManageAnalysisProfiles({ actor_id: 'a', role: 'super_admin', grants: [{ capability: 'installation:manage', project_id: 'one' }] })).toBe(false)
 expect(canManageAnalysisProfiles({ actor_id: 'a', role: 'super_admin', grants: [{ capability: 'installation:manage', project_id: null }] })).toBe(true)
})
it('exports the complete server package and downloads a compact package that remains importable at the size limit', async () => {
 fetcher.mockResolvedValueOnce(Response.json(pack))
 expect(await exportAnalysisProfile(summary.id, new AbortController().signal)).toEqual(pack)
 expect(fetcher.mock.calls.at(-1)![0]).toBe('/api/v1/analysis-profiles/apv_1/export')
 const overhead = new TextEncoder().encode(JSON.stringify({ ...pack, padding: '' })).length
 const bounded = { ...pack, padding: 'x'.repeat(16 * 1024 * 1024 - overhead) }
 let captured: Blob | null = null
 const click = vi.fn()
 vi.stubGlobal('document', { createElement: () => ({ href: '', download: '', click }) })
 vi.stubGlobal('URL', { createObjectURL: (blob: Blob) => { captured = blob; return 'blob:profile' }, revokeObjectURL: vi.fn() })
 downloadAnalysisProfile(bounded)
 expect(click).toHaveBeenCalledOnce()
 expect(captured!.size).toBe(16 * 1024 * 1024)
 const file = new File([captured!], 'roundtrip.nexora-profile.json')
 expect((await readAnalysisProfileFile(file)).models).toEqual(pack.models)
})
