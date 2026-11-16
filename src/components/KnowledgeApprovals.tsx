import {knowledgeReviewUrl} from '../utils/knowledgeReviewUrl'
import { useState } from 'react'
import { Link } from 'react-router'
import { Check,X,RefreshCw } from 'lucide-react'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { useTranslation } from '../hooks/useTranslation'
import { parseKnowledgeReviews } from '../utils/parseKnowledgeReviews'
import { writeServiceRequest } from '../services/writeServiceRequest'
import type { KnowledgeReview } from '../types/KnowledgeReview'
import IconButton from './IconButton'
import Pagination from './Pagination'
import DataMessage from './DataMessage'
export default function KnowledgeApprovals(){
 const {t}=useTranslation(),[page,setPage]=useState(1),[selected,setSelected]=useState<string[]>([]),mutation=useIntegrationMutation()
 const remote=useApiData(`/api/v1/knowledge-reviews?page=${page}`,parseKnowledgeReviews)
 const decide=async(r:KnowledgeReview,decision:string)=>{const path=`/api/v1/knowledge-reviews/${r.id}`,input={expected_revision:r.revision,decision};if(await mutation.run({path,input},async(_signal,key)=>{await writeServiceRequest(path,input,key)}))remote.reload()}
 const actionable=(remote.data?.items??[]).filter(r=>r.kind!=='feature_proposal'&&r.can_decide)
 const decideSelected=async(decision:string)=>{for(const id of selected){const review=actionable.find(r=>r.id===id);if(review)await decide(review,decision)}setSelected([])}

 return <section className="mt-8 border-t border-base-300 pt-6"><header className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">{t('Revisiones de conocimiento')}</h2><div className="flex items-center gap-2"><IconButton label={t('Actualizar')} onClick={remote.reload}><RefreshCw size={16}/></IconButton>{selected.length>0&&<><button className="btn btn-sm btn-success" disabled={mutation.busy} onClick={()=>void decideSelected('approved')}><Check size={15}/>{t('Aprobar seleccionadas')}</button><button className="btn btn-sm btn-error" disabled={mutation.busy} onClick={()=>void decideSelected('rejected')}><X size={15}/>{t('Rechazar seleccionadas')}</button></>}</div></header><Pagination page={page} total={remote.data?.total??0} count={remote.data?.items.length??0} hasNext={page*20<(remote.data?.total??0)} onPrevious={()=>{setSelected([]);setPage(page-1)}} onNext={()=>{setSelected([]);setPage(page+1)}}/><DataMessage loading={remote.loading} error={remote.error} onRetry={remote.reload}/>{actionable.length>0&&<label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" className="checkbox checkbox-sm" aria-label={t('Seleccionar página')} checked={actionable.every(r=>selected.includes(r.id))} onChange={event=>setSelected(event.target.checked?actionable.map(r=>r.id):[])}/>{t('Seleccionar página')}</label>}{mutation.error&&<p role="alert" className="text-error">{mutation.error}</p>}<ul className="divide-y divide-base-300">{remote.data?.items.map(r=><li key={r.id} className="flex flex-wrap items-center justify-between gap-3 py-4"><div className="flex min-w-0 items-start gap-3">{r.kind!=='feature_proposal'&&r.can_decide&&<input type="checkbox" className="checkbox checkbox-sm mt-1" aria-label={`${t('Seleccionar')} ${r.title}`} checked={selected.includes(r.id)} onChange={event=>setSelected(current=>event.target.checked?[...current,r.id]:current.filter(id=>id!==r.id))}/>}<div><Link to={knowledgeReviewUrl(r)} className="font-medium hover:underline">{r.title}</Link><p className="mt-1 text-xs text-base-content/55">{t(r.document_kind)} · {t('Versión')} {r.resource_revision}{r.current_revision!==r.resource_revision&&` · ${t('Hay una versión más reciente')}`}</p></div></div>{r.kind!=='feature_proposal'&&r.can_decide&&<div className="flex gap-1"><IconButton label={t('Aprobar versión')} disabled={mutation.busy||r.current_revision!==r.resource_revision} onClick={()=>void decide(r,'approved')}><Check size={16}/></IconButton><IconButton label={t('Rechazar versión')} disabled={mutation.busy} onClick={()=>void decide(r,'rejected')}><X size={16}/></IconButton></div>}</li>)}</ul>{remote.data?.total===0&&<p className="py-4 text-sm text-base-content/55">{t('No hay revisiones pendientes.')}</p>}</section>
}
