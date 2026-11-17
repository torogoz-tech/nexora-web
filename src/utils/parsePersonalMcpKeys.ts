import { requireRecord } from './requireRecord'
import type { PersonalMcpKeysData } from '../types/PersonalMcpKeysData'
export function parsePersonalMcpKeys(value: unknown): PersonalMcpKeysData {
 const v = requireRecord(value)
 const invalid = () => Error('La configuración de acceso MCP no es válida.')
 const text = (value: unknown) => { if (typeof value !== 'string' || !value) throw invalid(); return value }
 const nullable = (value: unknown) => value === null || value === undefined ? null : text(value)
 const strings = (value: unknown) => { if (!Array.isArray(value) || value.length > 256) throw invalid(); return value.map(text) }
 if (!Array.isArray(v.items) || v.items.length > 1000 || !Array.isArray(v.projects) || v.projects.length > 256 || v.mcp_url !== '/mcp' || typeof v.can_create !== 'boolean' || typeof v.can_include_global !== 'boolean') throw invalid()
 if(v.has_more!==undefined&&(typeof v.has_more!=='boolean'||v.next_after!==null&&typeof v.next_after!=='string'||v.has_more!==!!v.next_after))throw invalid()
 return {
  ...(v.has_more===undefined?{}:{has_more:v.has_more as boolean,next_after:v.next_after as string|null}),
  items: v.items.map(value => {
   const item = requireRecord(value), scope = requireRecord(item.scope)
   if (typeof scope.installation !== 'boolean' || typeof scope.all_projects !== 'boolean') throw invalid()
   return { id: text(item.id), actor_id: text(item.actor_id), name: text(item.name), expires_at: nullable(item.expires_at), revoked_at: nullable(item.revoked_at), last_mcp_at: nullable(item.last_mcp_at), mcp_client_name: nullable(item.mcp_client_name), mcp_client_version: nullable(item.mcp_client_version), scope: { capabilities: strings(scope.capabilities), project_ids: strings(scope.project_ids), installation: scope.installation, all_projects: scope.all_projects } }
  }),
  projects: v.projects.map(value => { const project = requireRecord(value); return { id: text(project.id), name: text(project.name) } }),
  mcp_url: '/mcp', server_time: text(v.server_time), can_create: v.can_create, can_include_global: v.can_include_global,
 }
}
