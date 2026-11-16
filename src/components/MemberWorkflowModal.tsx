import {useState} from 'react'
import {Trash2} from 'lucide-react'
import {useTranslation} from '../hooks/useTranslation'
import {useApiData} from '../hooks/useApiData'
import {useWorkCatalog} from '../hooks/useWorkCatalog'
import {useIntegrationMutation} from '../hooks/useIntegrationMutation'
import {parseWorkflowPage} from '../utils/parseWorkflowPage'
import {assignDeveloperWorkflow} from '../services/assignDeveloperWorkflow'
import {removeDeveloperWorkflow} from '../services/removeDeveloperWorkflow'
import type {OrganizationMember} from '../types/OrganizationMember'
import IntegrationDialog from './IntegrationDialog'
import Dropdown from './Dropdown'
import DataMessage from './DataMessage'
import TextButton from './TextButton'
import IconButton from './IconButton'
import {parseDeveloperWorkflowAssignments} from '../utils/parseDeveloperWorkflowAssignments'
export default function MemberWorkflowModal({member,onClose,onSaved}:{member:OrganizationMember;onClose:()=>void;onSaved:()=>void}){
 const {t,dateLocale}=useTranslation(),[version,setVersion]=useState('')
 const flows=useWorkCatalog('/api/v1/workflows',parseWorkflowPage)
 const current=useApiData(`/api/v1/actors/${encodeURIComponent(member.id)}/workflows`,parseDeveloperWorkflowAssignments)
 const mutation=useIntegrationMutation(),single=member.role==='developer'
 const options=flows.items.filter(flow=>!flow.archived&&flow.latest_version_id).sort((a,b)=>a.name.localeCompare(b.name,dateLocale))
 const selected=options.find(flow=>flow.latest_version_id===version)
 const assignment=single?current.data?.[0]:current.data?.find(item=>item.workflow_id===selected?.id)
 const save=async()=>{const revision=assignment?.revision??0;const ok=await mutation.run({actor:member.id,version,revision},(signal,key)=>assignDeveloperWorkflow(member.id,version,revision,key,signal).then(()=>{}));if(ok)onSaved()}
 return <IntegrationDialog title={t('Asignar workflow a {0}',{'0':member.name})} busy={mutation.busy} onClose={onClose}>{flows.loading||current.loading||flows.error||current.error?<DataMessage loading={flows.loading||current.loading} error={flows.error??current.error} onRetry={()=>{flows.reload();current.reload()}}/>:<form className="space-y-5" onSubmit={event=>{event.preventDefault();void save()}}><p className="text-sm text-base-content/60">{t(single?'Cada desarrollador puede estar en un solo workflow. Sus tareas pueden pertenecer a distintos proyectos.':'Puedes asignar varios workflows. Al tomar una tarea, el miembro deberá elegir uno de sus workflows asignados.')}</p>{!!current.data?.length&&<ul className="space-y-2">{current.data.map(item=><li key={item.workflow_id} className="flex items-center justify-between gap-3 text-sm"><span>{flows.items.find(flow=>flow.id===item.workflow_id)?.name??item.workflow_id}</span><IconButton label={t('Retirar workflow')} disabled={mutation.busy} onClick={()=>void mutation.run({actor:member.id,remove:item.revision},async(signal,key)=>{await removeDeveloperWorkflow(item,'Workflow retirado de las asignaciones del miembro.',key,signal);current.reload();onSaved()})}><Trash2 size={16}/></IconButton></li>)}</ul>}<Dropdown label={t('Workflow')} value={version} onChange={setVersion} options={[{value:'',label:t('Selecciona una opción')},...options.map(flow=>({value:flow.latest_version_id!,label:flow.name}))]}/>{mutation.error&&<p role="alert" className="text-sm text-error">{t(mutation.error)}</p>}<div className="flex justify-end gap-2"><TextButton type="button" label={t('Cancelar')} disabled={mutation.busy} onClick={onClose}/><TextButton type="submit" label={t('Guardar cambios')} variant="primary" disabled={mutation.busy||!version||version===assignment?.workflow_version_id}/></div></form>}</IntegrationDialog>
}
