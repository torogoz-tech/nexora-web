import {useState} from 'react'
import {ChevronRight,Link,Search} from 'lucide-react'
import IntegrationDialog from './IntegrationDialog'
import IconButton from './IconButton'
import TextButton from './TextButton'
import DataMessage from './DataMessage'
import {useTranslation} from '../hooks/useTranslation'
import {useApiData} from '../hooks/useApiData'
import {useIntegrationMutation} from '../hooks/useIntegrationMutation'
import {parseTaskKnowledgeOptions} from '../utils/parseTaskKnowledgeOptions'
import {apiFetch} from '../services/apiFetch'
import type {TaskDetails} from '../types/TaskDetails'
export default function TaskKnowledgeLinkModal({task,kind,onClose,onChanged}: {task:TaskDetails;kind:'feature'|'requirement';onClose:()=>void;onChanged:()=>void}){
 const {t}=useTranslation(),mutation=useIntegrationMutation(),[after,setAfter]=useState<string|null>(null),[search,setSearch]=useState(''),[selected,setSelected]=useState('')
 const query=new URLSearchParams({kind,...(after?{after}:{})})
 const data=useApiData(`/api/v1/tasks/${encodeURIComponent(task.id)}/knowledge/options?${query}`,parseTaskKnowledgeOptions)
 const item=data.data?.items.find(x=>x.id===selected)
 return <IntegrationDialog title={t(kind==='feature'?'Vincular funcionalidad':'Vincular requerimiento')} busy={mutation.busy} onClose={onClose}>
 <header className="mb-4 flex justify-end gap-2"><TextButton type="button" label={t('Cancelar')} onClick={onClose} disabled={mutation.busy}/><TextButton type="button" label={t('Vincular')} variant="primary" disabled={!item||mutation.busy||data.loading} onClick={()=>{if(item)void mutation.run({task:task.id,revision:task.revision,kind,item},async(signal,key)=>{const response=await apiFetch(`/api/v1/tasks/${encodeURIComponent(task.id)}/knowledge`,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({kind,target_id:item.id,expected_revision:task.revision,expected_target_revision:item.revision,version_id:item.version_id,reason:'Relación vinculada desde el detalle de la tarea.'}),signal});if(!response.ok)throw Error(response.status===409?'La tarea o el elemento cambió. Actualiza antes de continuar.':'No pudimos vincular el elemento. Revisa tus permisos y el proyecto.');onChanged()})}}><Link size={15}/></TextButton></header>
 <label className="input input-sm mb-3 w-full"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} aria-label={t('Buscar en esta página')}/></label>
 {data.loading||data.error?<DataMessage loading={data.loading} error={data.error} onRetry={data.reload}/>:<div className="max-h-80 space-y-1 overflow-y-auto">{data.data?.items.filter(item=>item.name.toLowerCase().includes(search.toLowerCase())).map(item=><button type="button" key={item.id} aria-pressed={selected===item.id} onClick={()=>setSelected(item.id)} className={`w-full rounded-xl p-3 text-left text-sm ${selected===item.id?'bg-base-300':'hover:bg-base-200'}`}>{item.name}</button>)}</div>}
 <div className="mt-3 flex justify-end gap-2">{after&&<TextButton label={t('Primera página')} onClick={()=>{setAfter(null);setSelected('')}}/>}{data.data?.next_after&&<IconButton label={t('Página siguiente')} onClick={()=>{setAfter(data.data!.next_after);setSelected('')}}><ChevronRight size={15}/></IconButton>}</div>{mutation.error&&<p role="alert" className="mt-3 text-sm text-error">{t(mutation.error)}</p>}
 </IntegrationDialog>
}
