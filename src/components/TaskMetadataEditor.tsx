import TaskGovernanceFields from './TaskGovernanceFields'
import TaskAcceptanceCriteriaEditor from './TaskAcceptanceCriteriaEditor'
import { validTaskAcceptanceCriteria } from '../utils/validTaskAcceptanceCriteria'
import {useState} from 'react'
import {Save,X} from 'lucide-react'
import {useApiData} from '../hooks/useApiData'
import {useIntegrationMutation} from '../hooks/useIntegrationMutation'
import {useTranslation} from '../hooks/useTranslation'
import {parseTaskPoolOptions} from '../utils/parseTaskPoolOptions'
import {apiFetch} from '../services/apiFetch'
import MarkdownEditor from './MarkdownEditor'
import Dropdown from './Dropdown'
import TextButton from './TextButton'
import DataMessage from './DataMessage'
import type {TaskDetails} from '../types/TaskDetails'
export default function TaskMetadataEditor({task,onClose,onChanged}: {task:TaskDetails;onClose:()=>void;onChanged:()=>void}) {
 const {t}=useTranslation(),mutation=useIntegrationMutation(),[context,setContext]=useState(task.context),[uploading,setUploading]=useState(false),[title,setTitle]=useState(task.title),[code,setCode]=useState(task.type_code??''),[priority,setPriority]=useState(task.priority??'medium')
 const [knowledgeKind,setKnowledgeKind]=useState<'requirement'|'feature'>(task.primary_feature_id?'feature':'requirement'),[entryWorkflow,setEntryWorkflow]=useState(task.entry_workflow_id??''),[primaryKnowledge,setPrimaryKnowledge]=useState(task.primary_requirement_id??task.primary_feature_id??'')
 const [criteria,setCriteria]=useState<string[]>(task.acceptance_criteria??[])
 const options=useApiData(`/api/v1/tasks/options${task.project_id?`?project_id=${encodeURIComponent(task.project_id)}`:''}`,parseTaskPoolOptions)
 const purpose=options.data?.types.find(type=>type.code===code)?.purpose??task.purpose??'general'
 const ready=validTaskAcceptanceCriteria(criteria)&&title.trim()&&new TextEncoder().encode(title.trim()).length<=256&&options.data?.types.some(type=>type.code===code)&&!mutation.busy&&!uploading&&new TextEncoder().encode(context).length<=8000
 return <form className="mb-6 space-y-4" onSubmit={event=>{event.preventDefault();if(!ready)return;void mutation.run({task:task.id,revision:task.revision,title,code,priority,context,criteria},async(signal,key)=>{const response=await apiFetch(`/api/v1/tasks/${encodeURIComponent(task.id)}`,{method:'PATCH',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({expected_revision:task.revision,title:title.trim(),type_code:code,priority,context,acceptance_criteria:criteria,entry_workflow_id:task.lifecycle==='pending'&&purpose!=='general'?entryWorkflow||undefined:undefined,clear_entry_workflow:task.lifecycle==='pending'&&(!entryWorkflow||purpose==='general'),primary_requirement_id:(purpose==='product_design'||purpose==='general'&&knowledgeKind==='requirement')?primaryKnowledge||undefined:undefined,primary_feature_id:(purpose==='implementation'||purpose==='general'&&knowledgeKind==='feature')?primaryKnowledge||undefined:undefined,clear_primary_knowledge:!primaryKnowledge,reason:'Datos de tarea actualizados desde la web.'}),signal});if(!response.ok)throw Error(response.status===409?'La tarea cambió. Actualiza antes de continuar.':'No pudimos guardar los datos de la tarea.');onChanged()})}}>
 <header className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-semibold">{t('Editar tarea')}</h2><div className="flex gap-2"><TextButton type="button" label={t('Cancelar')} disabled={mutation.busy} onClick={onClose}><X size={15}/></TextButton><TextButton type="submit" label={t('Guardar cambios')} variant="primary" disabled={!ready}><Save size={15}/></TextButton></div></header>
 <fieldset disabled={mutation.busy} className="space-y-4"><label className="flex flex-col gap-2 text-xs">{t('Título')}<input className="input w-full" aria-label={t('Título de la tarea')} value={title} onChange={event=>setTitle(event.target.value)} maxLength={256} required/></label><div className="grid gap-4 sm:grid-cols-2"><label className="flex flex-col gap-2 text-xs">{t('Tipo')}<Dropdown label={t('Tipo de tarea')} value={code} options={options.data?.types.map(type=>({value:type.code,label:type.name}))??[]} onChange={value=>{setCode(value);setPrimaryKnowledge('');if(task.lifecycle==='pending')setEntryWorkflow('')}} disabled={options.loading||!!options.error}/></label><label className="flex flex-col gap-2 text-xs">{t('Prioridad')}<Dropdown label={t('Prioridad de la tarea')} value={priority} onChange={value=>setPriority(value as typeof priority)} options={[{value:'low',label:t('Baja')},{value:'medium',label:t('Media')},{value:'high',label:t('Alta')},{value:'critical',label:t('Crítica')}]}/></label></div><MarkdownEditor label={t('Contexto de la tarea')} value={context} onChange={setContext} onUploadingChange={setUploading} disabled={mutation.busy}/><TaskGovernanceFields knowledgeKind={knowledgeKind} onKnowledgeKind={setKnowledgeKind} projectId={task.project_id} purpose={purpose} workflow={entryWorkflow} onWorkflow={setEntryWorkflow} knowledge={primaryKnowledge} onKnowledge={setPrimaryKnowledge} options={options.data} assignee={task.assignee_id} disabled={mutation.busy} workflowDisabled={task.lifecycle!=='pending'}/><TaskAcceptanceCriteriaEditor value={criteria} onChange={setCriteria} disabled={mutation.busy}/></fieldset>
 {options.error&&<DataMessage error={options.error} onRetry={options.reload}/>} {mutation.error&&<p role="alert" className="text-sm text-error">{t(mutation.error)}</p>}
 </form>
}
