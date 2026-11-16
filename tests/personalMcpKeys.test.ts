import { afterEach, expect, it, vi } from 'vitest'
import { parsePersonalMcpKeys } from '../src/utils/parsePersonalMcpKeys'
import { personalMcpKeyStatus } from '../src/utils/personalMcpKeyStatus'
import { createPersonalMcpKey } from '../src/services/createPersonalMcpKey'
import { revokePersonalMcpKey } from '../src/services/revokePersonalMcpKey'
const fetcher = vi.hoisted(() => vi.fn())
vi.mock('../src/services/apiFetch', () => ({ apiFetch: fetcher }))
afterEach(() => vi.resetAllMocks())
const key = { id: 'key_1', actor_id: 'actor', name: 'Editor', expires_at: '2026-11-09T10:00:00Z', revoked_at: null, last_mcp_at: null, mcp_client_name: null, mcp_client_version: null, scope: { capabilities: ['tasks:read'], project_ids: ['p'], installation: false, all_projects: false } }
const value = { items: [key], projects: [{ id: 'p', name: 'Project' }], mcp_url: '/mcp', server_time: '2026-11-08T10:00:00Z', can_create: true, can_include_global: false }
it('copies only safe metadata and rejects an injected remote MCP address', () => {
 const parsed = parsePersonalMcpKeys({ ...value, items: [{ ...key, digest: 'private', key: 'private-secret' }] })
 expect(parsed.items[0]).not.toHaveProperty('digest')
 expect(parsed.items[0]).not.toHaveProperty('key')
 expect(() => parsePersonalMcpKeys({ ...value, mcp_url: 'https://other.example/mcp' })).toThrow()
})
it('does not label an unused key or generic REST activity as connected', () => {
 expect(personalMcpKeyStatus(key, value.server_time)).toBe('Sin actividad MCP')
 expect(personalMcpKeyStatus({ ...key, last_mcp_at: '2026-11-08T09:56:00Z' }, value.server_time)).toBe('Actividad MCP reciente')
 expect(personalMcpKeyStatus({ ...key, last_mcp_at: '2026-11-08T09:54:59Z' }, value.server_time)).toBe('Sin actividad MCP reciente')
 expect(personalMcpKeyStatus({ ...key, last_mcp_at: '2026-11-08T10:01:00Z' }, value.server_time)).toBe('Sin actividad MCP reciente')
 expect(personalMcpKeyStatus({ ...key, expires_at: '2026-11-07T10:00:00Z' }, value.server_time)).toBe('Vencida')
 expect(personalMcpKeyStatus({ ...key, revoked_at: value.server_time, last_mcp_at: value.server_time }, value.server_time)).toBe('Revocada')
})
it('sends bounded personal scope and idempotency key without trying to select an actor', async () => {
 fetcher.mockResolvedValueOnce(Response.json({ key: 'nxk_example.secret' }, { status: 201 }))
 const input = { name: 'Editor', project_ids: ['p'], read_only: true, include_global: false, expires_in_seconds: 86400 }
 const token = await createPersonalMcpKey(input, new AbortController().signal, 'once')
 expect(token).toBe('nxk_example.secret')
 expect(fetcher.mock.calls[0][0]).toBe('/api/v1/me/mcp-keys')
 expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual(input)
 expect(fetcher.mock.calls[0][1].headers['Idempotency-Key']).toBe('once')
})
it('does not try to recover an already issued secret and confirms revocation', async () => {
 fetcher.mockResolvedValueOnce(Response.json({}, { status: 409 }))
 await expect(createPersonalMcpKey({ name: 'Editor', project_ids: ['p'], read_only: true, include_global: false, expires_in_seconds: 86400 }, new AbortController().signal, 'once')).rejects.toThrow('no se puede recuperar')
 fetcher.mockResolvedValueOnce(new Response(null, { status: 204 }))
 await revokePersonalMcpKey('key/unsafe', new AbortController().signal, 'revoke')
 expect(fetcher.mock.calls.at(-1)![0]).toBe('/api/v1/me/mcp-keys/key%2Funsafe')
})
