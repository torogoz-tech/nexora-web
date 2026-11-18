import {transitionFailureMessage} from '../utils/transitionFailureMessage'
import {useContext} from 'react'
import {WorkspacePermissionsContext} from '../app/WorkspacePermissionsContext'
import {useAuth} from '../hooks/useAuth'
import {useApiData} from '../hooks/useApiData'
import {useTranslation} from '../hooks/useTranslation'
import {useIntegrationMutation} from '../hooks/useIntegrationMutation'
import {parseTaskTransitionRuns} from '../utils/parseTaskTransitionRuns'
import {apiFetch} from '../services/apiFetch'
import {RefreshCw,RotateCcw} from 'lucide-react'
import DataMessage from './DataMessage'
import IconButton from './IconButton'
import TaskTransitionApproval from './TaskTransitionApproval'
export default function TaskTransitionRuns({taskId,projectId,canRetry,onChanged}:{taskId:string;projectId:string|null;canRetry:boolean;onChanged:()=>void}){
 const {t}=useTranslation(),{session}=useAuth(),permissions=useContext(WorkspacePermissionsContext),data=useApiData(`/api/v1/tasks/${encodeURIComponent(taskId)}/transition-runs`,parseTaskTransitionRuns),mutation=useIntegrationMutation()
 const runs=(data.data??[]).filter((run,index)=>index===0||run.status!=='succeeded')
 if(!runs.length&&!data.error)return null
 const labels={waiting_external:'Esperando confirmación del proveedor',waiting_knowledge:'Esperando revisión de conocimiento',ready:'Aprobada; pendiente de continuar',running:'Ejecutando transición',waiting_approval:'Esperando aprobación',failed:'No se pudo avanzar',succeeded:'Transición completada'}
 const refresh=()=>{data.reload();onChanged()}
 return <section className="mt-5 min-w-0 border-t border-base-300 pt-4" aria-label={t('Ejecución de la transición')}>
  <header className="flex items-center justify-between gap-3"><h3 className="text-sm font-medium">{t('Ejecución de la transición')}</h3><IconButton label={t('Actualizar ejecución')} onClick={data.reload}><RefreshCw size={15}/></IconButton></header>
  <DataMessage loading={data.loading} error={t(data.error)} onRetry={data.reload}/>
  {runs.map(run=><div key={run.id} className="mt-3 text-xs"><div className="flex items-center justify-between gap-2"><p className={run.status==='failed'?'text-error':run.status==='waiting_approval'?'text-warning':run.status==='waiting_knowledge'?'text-info':'text-base-content/65'}>{t(labels[run.status])}</p>{canRetry&&run.actor_id===session?.actorId&&run.status==='failed'&&<IconButton label={t(run.execution_kind==='take_branches'?'Reintentar preparación de ramas':'Reintentar paso pendiente')} disabled={mutation.busy} onClick={()=>void mutation.run({taskId,run:run.id},async(signal,key)=>{const preparing=run.execution_kind==='take_branches';const response=await apiFetch(preparing?`/api/v1/tasks/${encodeURIComponent(taskId)}/take`:`/api/v1/tasks/${encodeURIComponent(taskId)}/transition-runs/${encodeURIComponent(run.id)}/retry`,{method:'POST',headers:{'Idempotency-Key':key,...(preparing?{'Content-Type':'application/json'}:{})},...(preparing?{body:JSON.stringify(run.parameters)}:{}),signal});refresh();if(!response.ok)throw Error('No pudimos reintentar la transición. Revisa el motivo en el timeline.')})}><RotateCcw size={15}/></IconButton>}</div>{run.message&&<p className="mt-2 leading-relaxed text-base-content/60">{t(transitionFailureMessage(run.error_code,run.message))}</p>}{run.error_code&&<p className="mt-1 text-base-content/40">{run.error_code}</p>}{run.advanced&&run.status==='failed'&&<p className="mt-2 text-base-content/60">{t('El estado ya cambió. El reintento solo continuará los pasos posteriores pendientes.')}</p>}{run.status==='waiting_approval'&&run.actor_id!==session?.actorId&&run.parameters&&permissions?.grants.some(grant=>grant.capability==='approvals:grant'&&(grant.project_id===null||grant.project_id===projectId))&&<TaskTransitionApproval run={run} onChanged={refresh}/>}</div>)}
  {mutation.error&&<p role="alert" className="mt-3 text-xs text-error">{t(mutation.error)}</p>}
 </section>
}
