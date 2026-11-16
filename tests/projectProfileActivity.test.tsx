import {expect,it,vi} from 'vitest'
import {renderToStaticMarkup} from 'react-dom/server'
import {MemoryRouter} from 'react-router'
import ProjectProfilePage from '../src/pages/ProjectProfilePage'
import {parseProjectProfile} from '../src/utils/parseProjectProfile'
const data={project:{id:'project',name:'Smart Ticket',description:null,archived:false,revision:1,created_at:'2026-01-01T00:00:00Z'},repositories:[],members:[{id:'person',name:'Ana',username:'oidc_ugly_identifier',position:'Technical lead',role:'technical_lead',avatar_revision:0}],priority_tasks:[],counts:{tasks:0,documents:0,requirements:0,features:0},contributions:[{date:'2026-01-01',count:1}],activity:[{id:'commit',project_id:'project',kind:'commit',title:'Add project activity',created_at:'2026-01-01T12:00:00Z',repository_id:'repository',repository_name:'team/product',commit_sha:'abcd',branches:['develop'],author:{id:'person',name:'Ana',position:'Technical lead',avatar_revision:0}}],year:2026}
vi.mock('../src/hooks/useApiData',()=>({useApiData:()=>({data:parseProjectProfile(data),loading:false,error:null,reload:vi.fn()})}))
it('shows repository commits with a link, branch and member position instead of an OIDC identifier',()=>{
 const html=renderToStaticMarkup(<MemoryRouter><ProjectProfilePage projectId="project"/></MemoryRouter>)
 expect(html).toContain('Add project activity')
 expect(html).toContain('team/product')
 expect(html).toContain('develop')
 expect(html).toContain('/code/repositories/project/repository/commits/abcd')
 expect(html).toContain('Technical lead')
 expect(html).not.toContain('oidc_ugly_identifier')
})

it('parses commit attribution and rejects malformed author identities',()=>{
 expect(parseProjectProfile(data).activity[0].author).toEqual({id:'person',name:'Ana',position:'Technical lead',avatar_revision:0})
 expect(()=>parseProjectProfile({...data,activity:[{...data.activity[0],author:{...data.activity[0].author,avatar_revision:-1}}]})).toThrow()
})
