import {useState} from 'react'
import {Save,ChevronRight,X} from 'lucide-react'
import {useProjects} from '../hooks/useProjects'
import {useTranslation} from '../hooks/useTranslation'
import {useIntegrationMutation} from '../hooks/useIntegrationMutation'
import {apiFetch} from '../services/apiFetch'
import Dropdown from './Dropdown'
import TextButton from './TextButton'
import IconButton from './IconButton'
import IntegrationDialog from './IntegrationDialog'
import DataMessage from './DataMessage'
import type {TaskDetails} from '../types/TaskDetails'
export default function ChangeTaskProjectModal({task,onClose,onChanged}: {task:TaskDetails;onClose:()=>void;onChanged:()=>void}) {
 const {t}=useTranslation(),projects=useProjects(),mutation=useIntegrationMutation(),[project,setProject]=useState(task.project_id??'')
 const options=[{value:'',label:t('Sin proyecto')},...projects.projects.filter(p=>!p.archived).map(p=>({value:p.id,label:p.name}))]
 if(task.project_id&&!options.some(p=>p.value===task.project_id))options.push({value:task.project_id,label:task.project_name??t('Proyecto actual')})
 return <IntegrationDialog title={t('Cambiar proyecto')} onClose={onClose} busy={mutation.busy}><form className="space-y-4" onSubmit={event=>{event.preventDefault();if(project===(task.project_id??''))return;void mutation.run({id:task.id,revision:task.revision,project},async(signal,key)=>{const response=await apiFetch(`/api/v1/tasks/${encodeURIComponent(task.id)}/project`,{method:'POST',headers:{'Content-Type':'application/json','Idempotency-Key':key},body:JSON.stringify({expected_revision:task.revision,project_id:project||null,reason:'Proyecto actualizado desde el detalle de la tarea.'}),signal});if(!response.ok)throw Error(response.status===409?'La tarea cambió o tiene relaciones que la vinculan al proyecto actual. Revisa sus relaciones antes de trasladarla.':response.status===403||response.status===404?'No tienes acceso para trasladar la tarea entre estos proyectos.':response.status===422?'El tipo o el responsable no está habilitado en el proyecto de destino.':'No pudimos cambiar el proyecto de la tarea.');onChanged()})}}>
 <header className="flex justify-end gap-2"><TextButton type="button" label={t('Cancelar')} disabled={mutation.busy} onClick={onClose}><X size={15}/></TextButton><TextButton type="submit" label={t('Guardar cambios')} variant="primary" disabled={mutation.busy||projects.status!=='ready'||project===(task.project_id??'')}><Save size={15}/></TextButton></header>
 <label className="flex flex-col gap-2 text-xs">{t('Proyecto')}<Dropdown label={t('Proyecto de la tarea')} value={project} onChange={setProject} options={options} disabled={mutation.busy||projects.status==='loading'}/></label>
 {projects.hasMore&&<IconButton label={t('Más proyectos')} disabled={projects.loadingMore||mutation.busy} onClick={()=>void projects.loadMore()}><ChevronRight size={15}/></IconButton>}
 <p className="text-sm text-base-content/55">{t(project?'La tarea conservará su responsable, evidencia e historial.':'Sin proyecto, la tarea será visible para todo el equipo.')}</p><p className="text-xs text-base-content/45">{t('Las relaciones con requerimientos, funcionalidades, subtareas y dependencias deben ser compatibles con el proyecto.')}</p>
 {projects.status!=='ready'&&projects.status!=='loading'&&<DataMessage error={t('No pudimos consultar los proyectos disponibles.')} onRetry={projects.retry}/>}{projects.pageError&&<DataMessage error={projects.pageError} onRetry={()=>void projects.loadMore()}/>}{mutation.error&&<p role="alert" className="text-sm text-error">{t(mutation.error)}</p>}
 </form></IntegrationDialog>
}
