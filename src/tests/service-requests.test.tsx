import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { canOpenWorkspacePath } from '../utils/canOpenWorkspacePath'
import { parseEffectivePermissions } from '../utils/parseEffectivePermissions'
import ServiceRequestDetailPage from '../pages/ServiceRequestDetailPage'
const state=vi.hoisted(()=>({data:{id:'srq_one',number:1,title:'Printer offline',body:'**Please help**',status:'new',type_id:'support',revision:1,created_at:'2026-11-12',can_manage:false,comments:[],attachments:[]}}))
vi.mock('../hooks/useApiData',()=>({useApiData:(path:string)=>({data:path.endsWith('/types')?{items:[]}:state.data,loading:false,error:null,reload:()=>{}})}))
vi.mock('../components/MarkdownEditor',()=>({default:()=> <textarea aria-label="Agregar comentario"/>}))
describe('isolated request workspace',()=>{
 it('accepts both non IT roles and denies technical routes even with stale technical grants',()=>{
  for(const role of ['user','supervisor']){
   const permissions=parseEffectivePermissions({actor_id:'a',role,grants:[{capability:'installation:manage',project_id:null}]})
   for(const path of ['/requests','/requests/new','/requests/srq_one','/settings/mcp','/settings/security'])expect(canOpenWorkspacePath(path,permissions)).toBe(true)
   for(const path of ['/tasks','/knowledge','/settings/members','/code','/projects/p'])expect(canOpenWorkspacePath(path,permissions)).toBe(false)
  }
 })
 it('renders shared Markdown conversation and excludes internal task and feature controls',()=>{
  const html=renderToStaticMarkup(<MemoryRouter><ServiceRequestDetailPage id="srq_one"/></MemoryRouter>)
  expect(html).toContain('<strong>Please help</strong>');expect(html).toContain('Conversación')
  expect(html).not.toContain('Crear tarea vinculada');expect(html).not.toContain('Trabajo interno relacionado')
 })
})
