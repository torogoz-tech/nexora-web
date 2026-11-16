import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { expect,it,vi } from 'vitest'
import KnowledgePublishButton from '../src/components/KnowledgePublishButton'
import WikiArticle from '../src/components/WikiArticle'
import { WorkspacePermissionsContext } from '../src/app/WorkspacePermissionsContext'
import { parseKnowledgeDocument } from '../src/utils/parseKnowledgeDocument'
import { parseKnowledgeVersion } from '../src/utils/parseKnowledgeVersion'
import type { KnowledgeDocument } from '../src/types/KnowledgeDocument'
import type { KnowledgeVersion } from '../src/types/KnowledgeVersion'
vi.mock('../src/hooks/useApiData',()=>({useApiData:()=>({data:{items:[],total:0},loading:false,error:null,reload:vi.fn()})}))
const document:KnowledgeDocument={id:'doc',project_id:'p',code:'req',kind:'requirement',archived:false,latest_version_id:'v1',latest_version_number:1,published_version_id:null,created_by:'a',created_at:'2026-11-10',updated_at:'2026-11-10',revision:2}
const version:KnowledgeVersion={id:'v1',document_id:'doc',project_id:'p',number:1,title:'Requirement',content:{kind:'requirement',body:{problem:'Problem',objective:'Objective',scope:'Team',business_actors:[],acceptance_criteria:[],source:'Business'}},origin:'agent_proposed',state_id:'draft',state_revision:1,reason:'Initial',created_by:'a',created_at:'2026-11-10',checksum:'hash',needs_review:false,evidence:[]}
it('requests workflow-free review only for the latest revision and authorized project',()=>{
 const markup=(project:string|null,d=document,v=version)=>renderToStaticMarkup(createElement(WorkspacePermissionsContext.Provider,{value:{actor_id:'manager',role:'manager',grants:[{capability:'documents:write',project_id:project}]}},createElement(KnowledgePublishButton,{document:d,version:v,base:'/api',onPublished:()=>{}})))
 expect(markup('p')).toContain('Solicitar aprobación')
 expect(markup(null)).toContain('Solicitar aprobación')
 expect(markup('other')).not.toContain('Solicitar aprobación')
 expect(markup('p',{...document,published_version_id:'v1'})).toContain('Aprobada')
 expect(markup('p',{...document,archived:true})).toBe('')
 expect(markup('p',document,{...version,id:'older'})).toBe('')
 expect(parseKnowledgeDocument(document).revision).toBe(2)
 expect(parseKnowledgeVersion(version).state_revision).toBe(1)
})
it('places the outline before the main article with sticky scrolling and the version in its header',()=>{
 const html=renderToStaticMarkup(createElement(WikiArticle,{title:'Article',category:'Document',sections:[{id:'content',title:'Section',text:'Body'}],metadata:[],toolbar:createElement('span',null,'Versión 3')}))
 expect(html.indexOf('<aside')).toBeLessThan(html.indexOf('<header'))
 expect(html).toContain('md:sticky')
 expect(html.indexOf('Versión 3')).toBeLessThan(html.indexOf('id="wiki-title"'))
})
