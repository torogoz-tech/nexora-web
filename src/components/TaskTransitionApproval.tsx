import {useState} from 'react'
import {Check} from 'lucide-react'
import {useIntegrationMutation} from '../hooks/useIntegrationMutation'
import {useTranslation} from '../hooks/useTranslation'
import {apiFetch} from '../services/apiFetch'
import TransitionApprovalFacts from './TransitionApprovalFacts'
import type {TaskTransitionRun} from '../types/TaskTransitionRun'
export default function TaskTransitionApproval({run,onChanged}:{run:TaskTransitionRun;onChanged:()=>void}){
 const {t}=useTranslation(),[reason,setReason]=useState(''),mutation=useIntegrationMutation()
 return <form className="mt-3 space-y-2" onSubmit={event=>{event.preventDefault();void mutation.run({run:run.id,reason},async(signal,key)=>{const response=await apiFetch(`/api/v1/tasks/${encodeURIComponent(run.task_id)}/approvals`,{method:'POST',headers:{'Idempotency-Key':key,'Content-Type':'application/json'},body:JSON.stringify({transition_id:run.transition_id,parameters:run.parameters,reason,expires_in_seconds:3600}),signal});if(!response.ok)throw Error('No pudimos aprobar la transición. Actualiza y revisa tus permisos.');onChanged()})}}>
  <TransitionApprovalFacts run={run}/><label className="flex flex-col gap-1"><span>{t('Motivo de la aprobación')}</span><textarea className="textarea w-full" value={reason} maxLength={4000} required disabled={mutation.busy} onChange={event=>setReason(event.target.value)}/></label>
  <button className="btn btn-sm" type="submit" disabled={!reason.trim()||mutation.busy}><Check size={15}/>{t('Aprobar y continuar')}</button>
  {mutation.error&&<p role="alert" className="text-error">{t(mutation.error)}</p>}
 </form>
}
