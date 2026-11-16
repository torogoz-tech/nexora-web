import type { PersonalMcpKeyMetadata } from './PersonalMcpKeyMetadata'
export type PersonalMcpKeysData = {
 items: PersonalMcpKeyMetadata[]
 next_after?: string | null
 has_more?: boolean
 projects: { id: string; name: string }[]
 mcp_url: '/mcp'
 server_time: string
 can_create: boolean
 can_include_global: boolean
}
