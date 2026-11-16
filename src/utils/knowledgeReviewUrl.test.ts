import {describe,it,expect} from 'vitest'
import {knowledgeReviewUrl} from './knowledgeReviewUrl'
import {parseKnowledgeReviews} from './parseKnowledgeReviews'
import {parseProducts} from './parseProducts'
describe('Products and knowledge review contracts',()=>{
 it('routes requirements and feature proposals to their own detail pages',()=>{
  const r=parseKnowledgeReviews({total:1,items:[{id:'r1',kind:'project_document',resource_id:'doc1',project_id:'p1',title:'OTP',document_kind:'requirement',status:'pending',revision:1,resource_revision:2,current_revision:2}]}).items[0]!
  expect(knowledgeReviewUrl(r)).toBe('/knowledge/requirements?project=p1&article=doc1')
  expect(knowledgeReviewUrl({...r,kind:'feature_proposal'})).toBe('/knowledge/features/proposals/r1?project=p1')
 })
 it('supports a public product without technical project links',()=>{
  const p=parseProducts({items:[{id:'prd1',name:'Smart Ticket',description:'Tickets',revision:1,archived:false}],can_manage:false})
  expect(p.items[0]?.project_ids).toBeUndefined()
  expect(()=>parseProducts({items:[{id:'prd1',name:'Bad',revision:1,archived:false,description:'',project_ids:[5]}]})).toThrow()
 })
})
