import { useContext } from 'react'
import { Check, Send, X } from 'lucide-react'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { useTranslation } from '../hooks/useTranslation'
import { parseKnowledgeReviews } from '../utils/parseKnowledgeReviews'
import { writeServiceRequest } from '../services/writeServiceRequest'
import IconButton from './IconButton'
export default function KnowledgeReviewControls({kind,id,revision,project,onChanged}:{kind:string;id:string;revision:number;project?:string|null;onChanged?:()=>void}){
 const {t}=useTranslation(),permissions=useContext(WorkspacePermissionsContext),mutation=useIntegrationMutation()
 const reviews=useApiData(`/api/v1/knowledge-reviews?${new URLSearchParams({resource_id:id,status:''})}`,parseKnowledgeReviews)
 const review=reviews.data?.items.find(r=>r.kind===kind&&r.resource_revision===revision)
 const capability=kind==='contribution'?'knowledge:contribute':project?'documents:write':'organization-knowledge:write'
 const canRequest=permissions?.grants.some(g=>g.capability===capability&&(g.project_id===null||g.project_id===project))
 const change=async(decision?:string)=>{const path=decision&&review?`/api/v1/knowledge-reviews/${review.id}`:'/api/v1/knowledge-reviews';const input=decision&&review?{decision,expected_revision:review.revision}:{kind,resource_id:id,expected_revision:revision};const ok=await mutation.run({path,input},async(_signal,key)=>{await writeServiceRequest(path,input,key)});if(ok){reviews.reload();onChanged?.()}}
 return <div className="my-3 flex flex-wrap items-center gap-2 text-xs">{review&&<span className={`badge badge-sm ${review.status==='approved'?'badge-success':review.status==='rejected'?'badge-error':'badge-ghost'}`}>{t(review.status==='approved'?'Aprobada':review.status==='rejected'?'Rechazada':'Pendiente de aprobación')} · {t('Versión')} {revision}</span>}{canRequest&&!reviews.loading&&review?.status!=='pending'&&review?.status!=='approved'&&<IconButton label={t('Solicitar aprobación')} disabled={mutation.busy} onClick={()=>void change()}><Send size={16}/></IconButton>}{review?.status==='pending'&&review.can_decide&&<><IconButton label={t('Aprobar versión')} disabled={mutation.busy} onClick={()=>void change('approved')}><Check size={16}/></IconButton><IconButton label={t('Rechazar versión')} disabled={mutation.busy} onClick={()=>void change('rejected')}><X size={16}/></IconButton></>}{(mutation.error||reviews.error)&&<p role="alert" className="text-error">{mutation.error||reviews.error}</p>}</div>
}
