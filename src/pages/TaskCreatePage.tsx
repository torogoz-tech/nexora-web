import { useProjectPreference } from '../hooks/useProjectPreference'
import { readApiJson } from '../services/readApiJson'
import { writeServiceRequest } from '../services/writeServiceRequest'
import { parseServiceRequest } from '../utils/parseServiceRequest'
import { useContext, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { WorkspacePermissionsContext } from '../app/WorkspacePermissionsContext'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { parseTaskDetails } from '../utils/parseTaskDetails'
import { taskDetailPath } from '../utils/taskDetailPath'
import { taskReturnPath } from '../utils/taskReturnPath'
import CreateTaskForm from '../components/CreateTaskForm'
import DataMessage from '../components/DataMessage'
import RowAction from '../components/RowAction'
export default function TaskCreatePage() {
  const { t } = useTranslation(), navigate = useNavigate(), [params] = useSearchParams()
  const [linkError,setLinkError]=useState(''),[createdTask,setCreatedTask]=useState<string|null>(null)
  const requestId=params.get('request')
  async function finish(id:string){setCreatedTask(id);try{if(requestId){const request=parseServiceRequest(await readApiJson(`/api/v1/requests/${encodeURIComponent(requestId)}`,new AbortController().signal));await writeServiceRequest(`/api/v1/requests/${request.id}/links`,{kind:'task',target_id:id,expected_revision:request.revision})}navigate(taskDetailPath(id,returnTo),{replace:true})}catch{setLinkError('La tarea se creó, pero no pudimos vincular la solicitud. Reintenta la vinculación.')}}
  const permissions = useContext(WorkspacePermissionsContext)
  const parentId = params.get('parent'), returnTo = taskReturnPath(params.get('returnTo'))
  const parent = useApiData(parentId ? `/api/v1/tasks/${encodeURIComponent(parentId)}` : null, parseTaskDetails)
  const invalid = !!parent.data && parent.data.id !== parentId
  const selectedProject = useProjectPreference(params.get('project'))
  return <section className="min-w-0 flex-1" aria-label={t(parentId ? 'Crear subtarea' : 'Crear tarea')}>
    <header className="mb-7"><RowAction to={returnTo} label={t('Volver')}><ArrowLeft size={16}/></RowAction>{parent.data && <p className="mt-2 break-words text-sm text-base-content/55">{parent.data.title}</p>}</header>
    {linkError&&<p role="alert" className="text-error">{t(linkError)}</p>}{createdTask?<button className="btn btn-sm" onClick={()=>void finish(createdTask)}>{t('Vincular solicitud')}</button>:!permissions?.role ? <p role="alert" className="text-sm text-error">{t('No tienes permiso para realizar esta acción.')}</p> : parentId && (parent.loading || parent.error || invalid || !parent.data) ? <DataMessage loading={parent.loading} error={invalid ? t('El detalle no corresponde a esta tarea.') : parent.error} onRetry={parent.reload}/> : <CreateTaskForm parent={parentId ? parent.data ?? undefined : undefined} initialProjectId={parentId ? undefined : (selectedProject && !['organization','none'].includes(selectedProject) ? selectedProject : '')} initialTypeCode={params.get('type') ?? ''} onCancel={() => navigate(returnTo)} onCreated={id => { window.dispatchEvent(new CustomEvent('nexora:invalidate',{detail:{projectId:null,topics:['tasks']}})); void finish(id) }}/>}
  </section>
}
