import { MemoryRouter } from 'react-router'
import PersonalMcpHistoryPage from '../src/pages/PersonalMcpHistoryPage'
import { getReturnPath } from '../src/utils/getReturnPath'
import { canOpenWorkspacePath } from '../src/utils/canOpenWorkspacePath'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import McpSettingsPage from '../src/pages/McpSettingsPage'
const fixture = vi.hoisted(() => ({ data: { items: [{ id: 'key_1', actor_id: 'a', name: 'Editor assistant', expires_at: '2026-11-09T10:00:00Z', revoked_at: null as string | null, last_mcp_at: null, mcp_client_name: null, mcp_client_version: null, scope: { capabilities: ['tasks:read'], project_ids: ['p'], installation: false, all_projects: false } }], projects: [{ id: 'p', name: 'Project' }], mcp_url: '/mcp', server_time: '2026-11-08T10:00:00Z', can_create: true, can_include_global: false } }))
vi.mock('../src/hooks/useApiData', () => ({ useApiData: () => ({ data: fixture.data, loading: false, error: null, reload: vi.fn() }) }))
vi.mock('../src/hooks/useIntegrationMutation', () => ({ useIntegrationMutation: () => ({ busy: false, error: null, clearError: vi.fn(), run: vi.fn() }) }))
it('offers personal keys, connection instructions and honest recent-activity wording', () => {
 const html = renderToStaticMarkup(createElement(MemoryRouter,null,createElement(McpSettingsPage)))
 expect(html).toContain('Generar clave MCP')
 expect(html).toContain('Editor assistant')
 expect(html).toContain('<table')
 expect(html).not.toContain('<details')
 expect(html).toContain('Sin actividad MCP')
 expect(html).toContain('no representa una conexión permanente')
 expect(html).toContain('Cómo conectar tu asistente')
 expect(html).toContain('Sus proyectos y permisos se actualizan automáticamente')
 expect(html).toContain('nexora_projects_list')
 expect(html).not.toContain('Incluir permisos globales ya autorizados')
 expect(html).not.toContain('Conectado')
 expect(html).not.toContain('<select')
})

it('separates revoked and expired keys into a read-only personal history page',()=>{
 const active=fixture.data.items[0]!
 fixture.data.items=[active,{...active,id:'revoked',name:'Revoked verification',revoked_at:'2026-11-08T09:00:00Z'},{...active,id:'expired',name:'Expired verification',expires_at:fixture.data.server_time}]
 const profile=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(McpSettingsPage)))
 expect(profile).toContain('Editor assistant')
 expect(profile).not.toContain('Revoked verification')
 expect(profile).not.toContain('Expired verification')
 expect(profile).toContain('href="/settings/mcp/history"')
 const history=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(PersonalMcpHistoryPage)))
 expect(history).toContain('Revoked verification')
 expect(history).toContain('Expired verification')
 expect(history).not.toContain('Editor assistant')
 expect(history).not.toContain('Revocar clave MCP')
 expect(history).toContain('href="/settings/mcp"')
 expect(getReturnPath('/profile/mcp-history')).toBe('/profile/mcp-history')
 expect(canOpenWorkspacePath('/settings/mcp/history',{actor_id:'a',role:null,grants:[]})).toBe(true)
})

it('caps each history view at twenty entries and requests an inactive server page',()=>{
 const sample=fixture.data.items[0]!
 fixture.data.items=Array.from({length:25},(_,i)=>({...sample,id:`old-${i}`,name:`Historical key ${i}`,revoked_at:'2026-11-08T09:00:00Z'}))
 const html=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(PersonalMcpHistoryPage)))
 expect(html.match(/<li class=/g)).toHaveLength(20)
 expect(html).toContain('Historical key 19')
 expect(html).not.toContain('Historical key 20')
 expect(html).toContain('Página 1')
})

it('describes inherited access without presenting a frozen project selection',()=>{
 const key=fixture.data.items[0]!
 fixture.data.items=[{...key,revoked_at:null,expires_at:'2026-11-09T10:00:00Z',scope:{...key.scope,project_ids:[],installation:true,all_projects:true}}]
 const html=renderToStaticMarkup(createElement(MemoryRouter,null,createElement(McpSettingsPage)))
 expect(html).toContain('Proyectos y permisos vigentes del miembro')
 expect(html).not.toContain('Permisos globales</p>')
})
