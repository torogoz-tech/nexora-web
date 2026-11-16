import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect, it, vi } from 'vitest'
import PullRequestReviews from '../src/components/PullRequestReviews'
vi.mock('../src/hooks/useApiData',()=>({useApiData:()=>({data:[{id:'review',head_sha:'head',base_sha:'old-base',status:'completed',created_at:'2026-11-08T00:00:00Z',model:'fixture',report:{summary:'Stored report',findings:[],limitations:[]}}],loading:false,error:null,reload:vi.fn()})}))
vi.mock('../src/hooks/useWorkspacePermission',()=>({useWorkspacePermission:()=>true}))
vi.mock('../src/hooks/useIntegrationMutation',()=>({useIntegrationMutation:()=>({busy:false,error:null,run:vi.fn()})}))
it('keeps the saved report but marks it stale when only the PR base changes',()=>{
 const html=renderToStaticMarkup(createElement(PullRequestReviews,{basePath:'/fixture',projectId:'p',headSha:'head',baseSha:'new-base'}))
 expect(html).toContain('La PR cambió')
 expect(html).toContain('Stored report')
 expect(html).not.toContain('>Completada<')
})
