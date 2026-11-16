import {useState,useContext} from 'react'
import {useApiData} from '../hooks/useApiData'
import {useTranslation} from '../hooks/useTranslation'
import {useIntegrationMutation} from '../hooks/useIntegrationMutation'
import {WorkspacePermissionsContext} from '../app/WorkspacePermissionsContext'
import {parseTaskReleases} from '../utils/parseTaskReleases'
import {parseTaskRelease} from '../utils/parseTaskRelease'
import {transitionPoolTask} from '../services/transitionPoolTask'
import type {TaskDetails} from '../types/TaskDetails'
import DataMessage from './DataMessage'
export default function TaskReleaseExecution({task,transitionId,onChanged}:{task:TaskDetails;transitionId:string;onChanged:()=>void}){
 const {t}=useTranslation(),permissions=useContext(WorkspacePermissionsContext),mutation=useIntegrationMutation(),[selected,setSelected]=useState('')
 const base=task.project_id?`/api/v1/projects/${encodeURIComponent(task.project_id)}/releases`:null
 const releases=useApiData(base,parseTaskReleases),detail=useApiData(base&&selected?`${base}/${encodeURIComponent(selected)}`:null,parseTaskRelease)
 const canRun=['technical_lead','manager','super_admin'].includes(permissions?.role??'')&&permissions?.grants.some(grant=>grant.capability==='tasks:transition'&&(grant.project_id===null||grant.project_id===task.project_id))
 if(!canRun||!task.project_id)return null
 const release=detail.data,branches=release?.repositories?.map(repository=>({repository_id:repository.repository_id,branch_name:release.branch_name,expected_head_sha:repository.head_sha??''}))??[]
 return <section className="mt-5 rounded-xl border border-base-300 p-4" aria-label={t('Publicar versión seleccionada')}><h3 className="text-sm font-semibold">{t('Publicar versión seleccionada')}</h3><p className="my-3 text-xs text-base-content/60">{t('Selecciona una publicación preparada. Su revisión y los commits quedan sujetos a aprobación humana; el workflow se conserva para otras versiones.')}</p><DataMessage loading={releases.loading} error={releases.error} onRetry={releases.reload}/><form className="grid gap-3" onSubmit={event=>{event.preventDefault();if(!release||release.status!=='prepared'||!branches.length||!release.repositories?.every(repository=>repository.composition_status==='composed'))return;void mutation.run({taskId:task.id,taskRevision:task.revision,transitionId,releaseId:release.id,releaseRevision:release.revision,branches},async(signal,key)=>{try{await transitionPoolTask(task,transitionId,'','',key,signal,branches,{id:release.id,revision:release.revision})}finally{onChanged()}})}}><label className="grid gap-1 text-sm">{t('Publicación preparada')}<select className="select w-full" required value={selected} disabled={mutation.busy} onChange={event=>setSelected(event.target.value)}><option value="">{t('Seleccionar publicación')}</option>{releases.data?.items.filter(item=>item.status==='prepared').map(item=><option key={item.id} value={item.id}>{item.version} · {item.branch_name} · {t('Revisión {0}',{'0':item.revision})}</option>)}</select></label><DataMessage loading={detail.loading} error={detail.error} onRetry={detail.reload}/>{release&&<p className="text-xs text-base-content/60">{release.version} · {release.branch_name} · {t('Revisión {0}',{'0':release.revision})} · {release.tasks?.length??0} {t('Tareas seleccionadas')}</p>}<button type="submit" className="btn btn-sm btn-primary justify-self-start" disabled={mutation.busy||detail.loading||!release||release.status!=='prepared'||!branches.length||!release.repositories?.every(repository=>repository.composition_status==='composed')}>{t('Iniciar publicación con aprobación')}</button>{mutation.error&&<p role="alert" className="text-sm text-error">{t(mutation.error)}</p>}</form></section>
}
