import {transitionFailureMessage} from '../utils/transitionFailureMessage'
import {useState} from 'react'
import {ChevronLeft,TriangleAlert} from 'lucide-react'
import {useApiData} from '../hooks/useApiData'
import {useTranslation} from '../hooks/useTranslation'
import {parseTaskHistory} from '../utils/parseTaskHistory'
import {parseWorkflowVersion} from '../utils/parseWorkflowVersion'
import DataMessage from './DataMessage'
import IconButton from './IconButton'
export default function TaskWorkflowTimeline({taskId,workflowId,workflowVersionId}:{taskId:string;workflowId?:string|null;workflowVersionId?:string|null}){
 const {t,dateLocale}=useTranslation(),[cursors,setCursors]=useState<(number|null)[]>([null]),after=cursors.at(-1)
 const history=useApiData(workflowId?`/api/v1/tasks/${encodeURIComponent(taskId)}/timeline?limit=100${after?`&after=${after}`:''}`:null,parseTaskHistory)
 const version=useApiData(workflowId&&workflowVersionId?`/api/v1/workflows/${encodeURIComponent(workflowId)}/versions/${encodeURIComponent(workflowVersionId)}`:null,parseWorkflowVersion)
 if(!workflowId)return null
 const events=(history.data?.items??[]).filter(event=>event.operation==='task.pause'||event.operation==='task.resume'||event.operation==='task.transition_failed'||event.operation==='task.transition_waiting_approval'||event.details.after?.state_id&&(event.operation==='task.taken'||event.details.before?.state_id!==event.details.after.state_id||event.details.before?.workflow_version_id!==event.details.after.workflow_version_id))
 return <section className="mt-5 min-w-0" aria-label={t('Recorrido del workflow')}>
  <header className="mb-3 flex items-center justify-between gap-3"><h3 className="text-sm font-medium">{t('Recorrido del workflow')}</h3><div className="flex gap-1">{history.data?.next_after&&<IconButton label={t('Cambios recientes')} onClick={()=>setCursors(v=>[...v,history.data!.next_after!])}><ChevronLeft className="rotate-180" size={16}/></IconButton>}{after&&<IconButton label={t('Cambios anteriores')} onClick={()=>setCursors(v=>v.slice(0,-1))}><ChevronLeft className="rotate-180" size={16}/></IconButton>}</div></header>
  <DataMessage loading={history.loading} error={history.error} onRetry={history.reload}/>
  <ol className="flex min-w-0 gap-0 overflow-x-auto pb-3" tabIndex={0} aria-label={t('Cambios de estado')}>
   {events.map(event=>{
    const failed=event.operation==='task.transition_failed',waiting=event.operation==='task.transition_waiting_approval'
    const state=event.details.after?.workflow_version_id===workflowVersionId?version.data?.graph.states.find(state=>state.id===event.details.after?.state_id):undefined
    return <li key={event.id} className={`relative w-64 shrink-0 border-t pr-6 pt-4 ${failed?'border-error/40':'border-base-300'}`}>
     <span className={`absolute -top-1 size-2 rounded-full ${failed?'bg-error':'bg-primary'}`}/>
     <strong className="flex items-center gap-2 text-sm">{failed&&<TriangleAlert size={14}/>} {event.operation==='task.pause'?t('En pausa'):event.operation==='task.resume'?t('Retomada'):failed?t('No se pudo avanzar'):waiting?t('Esperando aprobación'):state?.name??event.details.after?.state_id}</strong>
     <time dateTime={event.created_at} className="mt-1 block text-xs text-base-content/55">{new Date(event.created_at).toLocaleString(dateLocale)}</time>
     <span className="mt-1 block text-xs text-base-content/45">{t('Revisión {0}',{'0':event.revision})}</span>
     {event.details.message&&<p className="mt-2 break-words text-xs leading-relaxed text-base-content/65">{t(transitionFailureMessage(event.details.code,event.details.message))}</p>}
     {event.details.code&&<p className="mt-1 break-all text-[11px] text-base-content/45">{event.details.code}</p>}
    </li>
   })}
  </ol>
  {!history.loading&&!history.error&&!events.length&&<p className="text-xs text-base-content/45">{t('No hay cambios de estado en esta parte del historial.')}</p>}
 </section>
}
