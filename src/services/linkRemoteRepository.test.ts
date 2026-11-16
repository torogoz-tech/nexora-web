import { afterEach, expect, it, vi } from 'vitest'
import { linkRemoteRepository } from './linkRemoteRepository'
import { parseRemoteRepositoryPage } from '../utils/parseRemoteRepositoryPage'
vi.mock('./getSession',()=>({getSession:()=>null}))
afterEach(()=>vi.unstubAllGlobals())
const selected = {provider:'github' as const,remote_id:'101',full_name:'team/backend'}
const pending = {id:'repo-1',project_id:'project-1',provider:'github',host:'github.com',requested_full_name:'team/backend',remote_full_name:null,remote_id:null,authorization_status:'awaiting_authorization',archived:false,revision:1,latest_source_commit:null}
const bound = {...pending,remote_id:'101',authorization_status:'authorized',revision:2}
const json=(data:unknown)=>new Response(JSON.stringify(data),{headers:{'Content-Type':'application/json'}})
it('resumes a pending inscription on later pages and pins the selected remote identity',async()=>{
 const fetcher=vi.fn(async(_path:unknown,options?:RequestInit)=>{
  if(options?.method==='POST') return json(bound)
  return json(fetcher.mock.calls.length===1?{items:[],next_cursor:'next'}:{items:[pending],next_cursor:null})
 })
 vi.stubGlobal('fetch',fetcher)
 await linkRemoteRepository('project-1','account-1',selected,new AbortController().signal,'request-1')
 expect(fetcher).toHaveBeenCalledTimes(3)
 expect(String(fetcher.mock.calls[1][0])).toContain('after=next')
 expect(fetcher.mock.calls[2][0]).toBe('/api/v1/projects/project-1/repositories/repo-1/authorize')
 expect(JSON.parse(String(fetcher.mock.calls[2][1]?.body))).toEqual({connection_id:'account-1',expected_revision:1,expected_remote_id:'101'})
})
it('does not duplicate or reauthorize an already linked remote repository',async()=>{
 const fetcher=vi.fn(async()=>json({items:[bound],next_cursor:null}));vi.stubGlobal('fetch',fetcher)
 await linkRemoteRepository('project-1','account-1',selected,new AbortController().signal,'request-2')
 expect(fetcher).toHaveBeenCalledOnce()
})
it('discovery validates bounded pages and canonical identities',()=>{
 expect(parseRemoteRepositoryPage({items:[selected],next_page:null}).items).toEqual([selected])
 expect(()=>parseRemoteRepositoryPage({items:[{...selected,remote_id:'00101'}],next_page:null})).toThrow()
 expect(()=>parseRemoteRepositoryPage({items:[selected],next_page:0})).toThrow()
})
