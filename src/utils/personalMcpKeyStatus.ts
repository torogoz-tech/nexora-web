import type { PersonalMcpKeyMetadata } from '../types/PersonalMcpKeyMetadata'
export function personalMcpKeyStatus(key: PersonalMcpKeyMetadata, now: string): 'Revocada' | 'Vencida' | 'Actividad MCP reciente' | 'Sin actividad MCP reciente' | 'Sin actividad MCP' {
 if (key.revoked_at) return 'Revocada'
 const current = Date.parse(now), expiry = key.expires_at ? Date.parse(key.expires_at) : Number.NaN, seen = key.last_mcp_at ? Date.parse(key.last_mcp_at) : Number.NaN
 if (Number.isFinite(expiry) && Number.isFinite(current) && expiry <= current) return 'Vencida'
 if (!key.last_mcp_at) return 'Sin actividad MCP'
 return Number.isFinite(current) && Number.isFinite(seen) && current >= seen && current - seen <= 300_000 ? 'Actividad MCP reciente' : 'Sin actividad MCP reciente'
}
