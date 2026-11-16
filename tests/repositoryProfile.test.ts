import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { expect,it,vi } from 'vitest'
import { parseRepositoryProfile } from '../src/utils/parseRepositoryProfile'
import { remoteRepositoryProfilePath } from '../src/utils/remoteRepositoryProfilePath'
import RepositoryProfilePage from '../src/pages/RepositoryProfilePage'
const data={repository:{id:null,remote_id:'42',name:'team/authentication',description:'Sign-in and OTP',provider:'github',status:'available',default_branch:'main',web_url:'https://github.com/team/authentication'},projects:[],synchronization:{state:null,updated_at:null,last_error:null},pull_requests:[],pull_requests_available:false,counts:{tasks:0,analyses:0,pull_requests:0},priority_tasks:[],contributions:[],activity:[],year:2026}
vi.mock('../src/hooks/useApiData',()=>({useApiData:()=>({data,loading:false,error:null,reload:vi.fn()})}))
it('opens a remote repository profile independently of a project selection',()=>{
 const path=remoteRepositoryProfilePath('connection',{remote_id:'42',full_name:'team/authentication',provider:'github'})
 expect(path).toBe('/code/accounts/connection/repositories/42?full_name=team%2Fauthentication')
 const html=renderToStaticMarkup(createElement(MemoryRouter,{initialEntries:[path]},createElement(RepositoryProfilePage,{connectionId:'connection',remoteId:'42'})))
 for(const text of ['team/authentication','Sign-in and OTP','main','Vincular repositorio','No hay proyectos vinculados','Las Pull Requests no están disponibles'])expect(html).toContain(text)
 expect(html).not.toContain('Selecciona un proyecto')
 expect(html).not.toContain('<dialog')
})
it('keeps inaccessible Pull Requests distinct from an empty authorized list',()=>{
 expect(parseRepositoryProfile(data).pull_requests_available).toBe(false)
 const result=parseRepositoryProfile({...data,pull_requests_available:true,pull_requests:[{id:1,number:7,title:'Add OTP',state:'open',url:'https://github.com/team/authentication/pull/7'}]})
 expect(result.pull_requests[0].number).toBe(7)
 expect(result.pull_requests_available).toBe(true)
})
it('validates records and removes unsafe external URLs and private metadata',()=>{
 const result=parseRepositoryProfile({...data,repository:{...data.repository,web_url:'javascript:alert(1)',token:'hidden'},pull_requests_available:true,pull_requests:[{id:'pr',number:7,title:'OTP',state:'open',url:'https://secret@bad.example/7'}]})
 expect(result.repository.web_url).toBeNull()
 expect(result.pull_requests[0].url).toBeNull()
 expect(JSON.stringify(result)).not.toContain('hidden')
 expect(()=>parseRepositoryProfile({...data,counts:{...data.counts,tasks:-1}})).toThrow()
 expect(()=>parseRepositoryProfile({...data,contributions:[{date:'2026-02-30',count:1}]})).toThrow()
 expect(()=>parseRepositoryProfile({...data,activity:[{id:'leak',project_id:'unauthorized',kind:'task',title:'private',created_at:'2026-01-01'}]})).toThrow()
})
