import { afterEach, expect, it, vi } from 'vitest'
import { parseAnalysisProfileAssignment } from '../src/utils/parseAnalysisProfileAssignment'
import { assignRepositoryAnalysisProfile } from '../src/services/assignRepositoryAnalysisProfile'
const fetcher = vi.hoisted(() => vi.fn())
vi.mock('../src/services/apiFetch', () => ({ apiFetch: fetcher }))
afterEach(() => vi.unstubAllGlobals())
const profile = { id: 'apv_1', key: 'web', version: '1.0.0', name: 'Web', language_id: 'typescript', checksum: 'a'.repeat(64), created_at: '2026-11-08T12:00:00Z' }
const base = { repository_id: 'repo', revision: 3, profile: null, can_manage: true }
it('normalizes legacy scalar assignments without silently switching to automatic', () => {
 expect(parseAnalysisProfileAssignment(base)).toMatchObject({ mode: 'legacy', profiles: [], last_selection: null })
 expect(parseAnalysisProfileAssignment({ ...base, profile })).toMatchObject({ mode: 'manual', profiles: [profile] })
})
it('reads only safe provenance and refuses malformed modes or results', () => {
 const used = { ...profile, files: ['src/index.ts'], package: { secret: 'hidden' } }
 const result = parseAnalysisProfileAssignment({ ...base, mode: 'automatic', profiles: [], last_selection: { policy: 'automatic-latest/v1', profiles: [used], uncovered_files: ['README.md'], excluded_files: [], packages: ['hidden'] } })
 expect(result.last_selection?.profiles[0]).not.toHaveProperty('package')
 expect(result.last_selection).not.toHaveProperty('packages')
 expect(result.last_selection?.uncovered_files).toEqual(['README.md'])
 expect(() => parseAnalysisProfileAssignment({ ...base, mode: 'inferred' })).toThrow()
 expect(() => parseAnalysisProfileAssignment({ ...base, mode: 'manual', profiles: 'bad' })).toThrow()
 expect(() => parseAnalysisProfileAssignment({ ...base, last_selection: { policy: 'manual/v1', profiles: [], uncovered_files: [123], excluded_files: [] } })).toThrow()
})
it('sends explicit automatic mode and multiple manual IDs with revision and retry key', async () => {
 fetcher.mockImplementation(() => Promise.resolve(Response.json({ ...base, mode: 'automatic', profiles: [], last_selection: null })))
 const signal = new AbortController().signal
 await assignRepositoryAnalysisProfile('project', 'repo', 3, { mode: 'automatic', profile_version_ids: [] }, 'key', signal)
 expect(JSON.parse(fetcher.mock.calls.at(-1)![1].body)).toMatchObject({ expected_revision: 3, mode: 'automatic', profile_version_ids: [] })
 await assignRepositoryAnalysisProfile('project', 'repo', 3, { mode: 'manual', profile_version_ids: ['one', 'two'] }, 'key2', signal)
 expect(JSON.parse(fetcher.mock.calls.at(-1)![1].body)).toMatchObject({ mode: 'manual', profile_version_ids: ['one', 'two'] })
 expect(fetcher.mock.calls.at(-1)![1].headers['Idempotency-Key']).toBe('key2')
})

it('explains conflicting manual file coverage without rendering arbitrary server details', async () => {
 fetcher.mockResolvedValueOnce(Response.json({ title: 'validation failed: selected profiles overlap on a file extension' }, { status: 422 }))
 await expect(assignRepositoryAnalysisProfile('p', 'repo', 3, { mode: 'manual', profile_version_ids: ['one', 'two'] }, 'key3', new AbortController().signal)).rejects.toThrow('mismas extensiones')
 fetcher.mockResolvedValueOnce(Response.json({ title: 'private server detail' }, { status: 422 }))
 await expect(assignRepositoryAnalysisProfile('p', 'repo', 3, { mode: 'manual', profile_version_ids: [] }, 'key4', new AbortController().signal)).rejects.toThrow('entre 1 y 64')
})

it('accepts the complete 1024-profile report and rejects larger responses', () => {
 const profiles = Array.from({ length: 1024 }, (_, index) => ({ ...profile, id: `profile_${index}`, files: [`src/file_${index}.ts`] }))
 const report = { policy: 'automatic-latest/v1', profiles, uncovered_files: [], excluded_files: [] }
 expect(parseAnalysisProfileAssignment({ ...base, mode: 'automatic', profiles: [], last_selection: report }).last_selection?.profiles).toHaveLength(1024)
 expect(() => parseAnalysisProfileAssignment({ ...base, mode: 'automatic', profiles: [], last_selection: { ...report, profiles: [...profiles, { ...profile, id: 'overflow', files: ['extra.ts'] }] } })).toThrow('no es válido')
})

it('reads partial decoding reports and refuses a complete result that silently skips files', () => {
 const skipped = { path: 'Controllers/Legacy.cs', profile_id: profile.id, reason: 'invalid UTF-8 at byte 1280', checksum: 'b'.repeat(64) }
 const report = { policy: 'automatic-latest/v1', profiles: [{...profile,files:['Good.cs']}], uncovered_files: [], excluded_files: [], status: 'partial', skipped_files: [skipped], decoded_files: [{path:'Good.cs',encoding:'UTF-16LE',checksum:'c'.repeat(64)}] }
 const parsed = parseAnalysisProfileAssignment({...base,last_selection:report}).last_selection!
 expect(parsed.status).toBe('partial'); expect(parsed.skipped_files?.[0]).toEqual(skipped); expect(parsed.decoded_files?.[0].encoding).toBe('UTF-16LE')
 expect(() => parseAnalysisProfileAssignment({...base,last_selection:{...report,status:'complete'}})).toThrow()
 expect(() => parseAnalysisProfileAssignment({...base,last_selection:{...report,skipped_files:[{...skipped,checksum:'invalid'}]}})).toThrow()
})
