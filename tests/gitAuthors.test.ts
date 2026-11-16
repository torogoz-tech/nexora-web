import { usableGitAuthorEmail } from '../src/utils/usableGitAuthorEmail'
import { beforeEach, expect, it, vi } from 'vitest'
import { parseGitAuthorPage } from '../src/utils/parseGitAuthorPage'
import { parseGitAliasPage } from '../src/utils/parseGitAliasPage'
import { parseGitAliasOptions } from '../src/utils/parseGitAliasOptions'
import { writeGitAlias } from '../src/services/writeGitAlias'
import { developerActivityReason } from '../src/utils/developerActivityReason'
import { parseDeveloperRatings } from '../src/utils/parseDeveloperRatings'
const request = vi.hoisted(() => vi.fn())
vi.mock('../src/services/apiFetch', () => ({ apiFetch: request }))
beforeEach(() => request.mockReset())
const author = { id: 'obs', provider: 'github', host: 'github.com', project_id: 'p', repository_id: 'r', commit_sha: 'abc123', author_name: 'Alias author', author_email: null, actor_id: null, actor_name: null, alias_id: null, occurred_at: '2026-11-08T12:00:00Z' }
const alias = { id: 'alias', actor_id: 'developer', actor_name: 'Ana', provider: 'github', host: 'github.com', email: 'ana@example.test', project_id: 'p', revision: 2, revoked_at: null }
it('keeps unknown authors unknown and strips unexpected private fields', () => {
 const parsed = parseGitAuthorPage({ items: [{ ...author, token: 'private' }], has_more: false, next_after: null })
 expect(parsed.items[0]?.author_email).toBeNull()
 expect(parsed.items[0]?.actor_id).toBeNull()
 expect(JSON.stringify(parsed)).not.toContain('private')
 expect(() => parseGitAuthorPage({ items: [{ ...author, provider: 'invented' }], has_more: false, next_after: null })).toThrow()
})
it('validates alias scope, revisions and authoritative options without inferring management from roles', () => {
 expect(parseGitAliasPage({ items: [alias], has_more: false, next_after: null }).items[0]?.revision).toBe(2)
 expect(() => parseGitAliasPage({ items: [{ ...alias, revision: 0 }], has_more: false, next_after: null })).toThrow()
 expect(() => parseGitAliasOptions({ actors: [], can_manage: true })).toThrow()
 expect(parseGitAliasOptions({ actors: [], can_manage: false, can_manage_global: false }).can_manage).toBe(false)
})
it('uses scoped alias payloads and idempotency without sending an author name as identity', async () => {
 request.mockResolvedValue(new Response('{}', { status: 200 }))
 const signal = new AbortController().signal
 await writeGitAlias('developer', { provider: 'github', host: 'github.com', email: 'ana@example.test', project_id: 'p', reason: 'Bind observed author' }, 'stable', signal)
 const [path, options] = request.mock.calls[0]!
 expect(path).toBe('/api/v1/members/developer/git-aliases')
 expect(options.headers['Idempotency-Key']).toBe('stable')
 expect(JSON.parse(options.body)).toEqual({ provider: 'github', host: 'github.com', email: 'ana@example.test', project_id: 'p', reason: 'Bind observed author' })
 expect(JSON.parse(options.body)).not.toHaveProperty('author_name')
})
it('reports conflicts without pretending an alias was saved', async () => {
 request.mockResolvedValue(new Response('{}', { status: 409 }))
 await expect(writeGitAlias('developer', { provider: 'gitlab', host: 'gitlab.com', email: 'ana@example.test', project_id: null, reason: 'Bind author' }, 'stable', new AbortController().signal)).rejects.toThrow('otro miembro')
})
it('distinguishes author activity from authenticated push evidence in rating copy', () => {
 expect(developerActivityReason(5, 'author_commit_recorded')).toBe('Se registraron commits atribuidos a este desarrollador durante el día.')
 expect(developerActivityReason(5, 'push_recorded')).toBe('Se registró un push verificado durante el día.')
 expect(developerActivityReason(0, 'no_push')).toBe('El día laboral terminó sin un push o commits atribuidos registrados.')
 const data = { actor_id: 'developer', year: 2026, annual: null, can_rate: false, weekly: [], monthly: [], daily: [{ date: '2026-11-08', excluded: false, push: false, score: 5, entries: [] }] }
 expect(parseDeveloperRatings(data).daily[0]?.authored).toBe(false)
 expect(parseDeveloperRatings({ ...data, daily: [{ ...data.daily[0], authored: true }] }).daily[0]?.authored).toBe(true)
})

it('does not offer to bind redacted or absent author identities', () => {
 expect(usableGitAuthorEmail(null)).toBe(false)
 expect(usableGitAuthorEmail('[REDACTED]')).toBe(false)
 expect(usableGitAuthorEmail('Display Name')).toBe(false)
 expect(usableGitAuthorEmail('author@example.test')).toBe(true)
})

it('disambiguates member names using an optional username without requiring it from legacy options', () => {
 expect(parseGitAliasOptions({actors:[{id:'one',name:'Ana',username:null},{id:'two',name:'Ana',username:'ana.two'}],can_manage:true,can_manage_global:false}).actors[1]?.username).toBe('ana.two')
})

it('shows revocation only for active aliases in a manageable scope', async () => {
 const { createElement } = await import('react')
 const { renderToStaticMarkup } = await import('react-dom/server')
 const { default: GitAliasList } = await import('../src/components/GitAliasList')
 const items = [alias, { ...alias, id: 'global', project_id: null }, { ...alias, id: 'revoked', revoked_at: '2026-11-08T00:00:00Z' }]
 const render = (canManage: boolean, canManageGlobal: boolean) => renderToStaticMarkup(createElement(GitAliasList, { items, canManage, canManageGlobal, projectName: () => 'Project', onRevoke: vi.fn() }))
 expect(render(false, false)).not.toContain('aria-label="Revocar alias Git"')
 expect(render(true, false).match(/aria-label="Revocar alias Git"/g)).toHaveLength(1)
 expect(render(true, true).match(/aria-label="Revocar alias Git"/g)).toHaveLength(2)
 expect(render(true, true)).not.toContain('Autor verificado')
})
