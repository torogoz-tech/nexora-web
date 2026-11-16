import {afterEach,describe,expect,it,vi} from 'vitest'
import {renderToStaticMarkup} from 'react-dom/server'
import {MemoryRouter} from 'react-router'
import {uploadTaskEvidence} from '../src/services/uploadTaskEvidence'
import {parseTaskDetails} from '../src/utils/parseTaskDetails'
import TaskKnowledgePanel from '../src/components/TaskKnowledgePanel'
import WikiMarkdown from '../src/components/WikiMarkdown'
vi.mock('../src/services/getSession',()=>({getSession:()=>null}))
afterEach(()=>vi.unstubAllGlobals())
describe('stored task evidence',()=>{
 it('uploads file bytes with an idempotency key and returns only a Nexora reference',async()=>{
  const fetch=vi.fn().mockResolvedValue(new Response(JSON.stringify({id:'tev_abc',url:'/api/v1/task-evidence/tev_abc/content'}),{status:200}))
  vi.stubGlobal('fetch',fetch)
  const result=await uploadTaskEvidence(new File([new Uint8Array([1,2,3])],'capture.png',{type:'image/png'}))
  expect(result.url).toBe('/api/v1/task-evidence/tev_abc/content')
  const [url,init]=fetch.mock.calls[0]!
  expect(url).toBe('/api/v1/task-evidence')
  expect(JSON.parse(init.body)).toEqual({name:'capture.png',image_base64:'AQID'})
  expect(init.headers.get('Idempotency-Key')).toBeTruthy()
 })
 it('rejects unsupported and oversized files before uploading',async()=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch)
  await expect(uploadTaskEvidence(new File(['<svg/>'],'x.svg',{type:'image/svg+xml'}))).rejects.toThrow()
  await expect(uploadTaskEvidence(new File([new Uint8Array(4*1024*1024+1)],'x.png',{type:'image/png'}))).rejects.toThrow()
  expect(fetch).not.toHaveBeenCalled()
 })
 it('does not embed or accept an unexpected external upload URL',async()=>{
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue(new Response(JSON.stringify({id:'tev_abc',url:'https://unexpected.example/image.png'}))))
  await expect(uploadTaskEvidence(new File(['x'],'x.png',{type:'image/png'}))).rejects.toThrow()
  const html=renderToStaticMarkup(<WikiMarkdown allowImages text="![Capture](/api/v1/task-evidence/tev_abc/content)"/>)
  expect(html).toContain('Cargando evidencia')
  expect(html).not.toContain('src="/api/v1/task-evidence')
 })
 it('validates historical process duration separately from work logs',()=>{
  const task={id:'t',project_id:null,lifecycle:'pending',workflow_id:null,workflow_version_id:null,state_id:null,assignee_id:null,title:'Task',context:'',created_by:'a',revision:1}
  expect(()=>parseTaskDetails({...task,timing:{active_seconds:-1,started_at:null,completed_at:null}})).toThrow()
 })
 it('shows both existing feature associations and a requirement linking action',()=>{
  const html=renderToStaticMarkup(<MemoryRouter><TaskKnowledgePanel projectId="project" canManage knowledge={{can_read:true,has_more:false,feature:null,features:[{id:'f',name:'Authentication',archived:false},{id:'g',name:'Access control',archived:false}],documents:[]}}/></MemoryRouter>)
  expect(html).toContain('Authentication');expect(html).toContain('Access control');expect(html).toContain('Vincular requerimiento')
 })
})
