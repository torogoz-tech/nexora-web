export type PersonalMcpKeyMetadata = {
 id: string
 actor_id: string
 name: string
 expires_at: string | null
 revoked_at: string | null
 last_mcp_at: string | null
 mcp_client_name: string | null
 mcp_client_version: string | null
 scope: { capabilities: string[]; project_ids: string[]; installation: boolean; all_projects: boolean }
}
