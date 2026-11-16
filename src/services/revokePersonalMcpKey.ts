import { apiFetch } from './apiFetch'
export async function revokePersonalMcpKey(id: string, signal: AbortSignal, key: string) {
 const response = await apiFetch(`/api/v1/me/mcp-keys/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'Idempotency-Key': key }, signal })
 if (!response.ok) throw Error('No pudimos revocar esta clave MCP.')
}
