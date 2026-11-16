import type {KnowledgeReview} from '../types/KnowledgeReview'
export function knowledgeReviewUrl(r:KnowledgeReview){
 if(r.kind==='feature_proposal')return `/knowledge/features/proposals/${encodeURIComponent(r.id)}?${new URLSearchParams({project:r.project_id??''})}`
 if(r.kind==='feature')return `/knowledge/features/${encodeURIComponent(r.resource_id)}?${new URLSearchParams({project:r.project_id??''})}`
 const paths:Record<string,string>={requirement:'/knowledge/requirements',business_rule:'/knowledge/rules',decision:'/knowledge/decisions',best_practice:'/knowledge/best-practices',security:'/knowledge/security',technical_debt:'/knowledge/technical-debt'}
 const query=new URLSearchParams({project:r.project_id??'organization',[r.kind==='contribution'?'contribution':'article']:r.resource_id})
 return `${paths[r.document_kind]??'/knowledge'}?${query}`
}
