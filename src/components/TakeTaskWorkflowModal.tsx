import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { mutatePoolTask } from '../services/mutatePoolTask'
import { parseRepositoryPage } from '../utils/parseRepositoryPage'
import type { DeveloperBoardTask } from '../types/DeveloperBoardTask'
import IntegrationDialog from './IntegrationDialog'
import TextButton from './TextButton'
import IconButton from './IconButton'
import DataMessage from './DataMessage'
export default function TakeTaskWorkflowModal({task,actorId,onClose,onChanged}:{task:DeveloperBoardTask;actorId:string;onClose:()=>void;onChanged:()=>void}) {
  const { t } = useTranslation(), mutation = useIntegrationMutation()
  const [repositories, setRepositories] = useState<string[]>([])
  const [cursors, setCursors] = useState<(string|null)[]>([null])
  const after = cursors.at(-1)
  const code = task.purpose === 'implementation' && !!task.project_id
  const data = useApiData(code ? `/api/v1/projects/${encodeURIComponent(task.project_id!)}/repositories?limit=100${after ? `&after=${encodeURIComponent(after)}` : ''}` : null, parseRepositoryPage)
  const choices = (code ? data.data?.items : [])?.filter(repo => repo.authorization_status === 'authorized' && !repo.archived && repo.source_kind !== 'local_snapshot') ?? []
  const ready = (task.purpose === 'general' || !!task.entry_workflow_id) && (!code || !!data.data && !data.error && (repositories.length > 0 || choices.length === 0 && cursors.length === 1 && !data.data.next_cursor))
  return <IntegrationDialog title={t('Tomar tarea')} busy={mutation.busy} onClose={onClose}>
    <form className="space-y-5" onSubmit={event => {event.preventDefault(); if (!ready) return; void mutation.run({task:task.id,revision:task.revision,repositories}, async(signal,key) => {await mutatePoolTask(task,'take',actorId,key,signal,undefined,undefined,repositories); onChanged()})}}>
      <p className="text-sm text-base-content/60">{t(task.purpose === 'general' ? 'La tarea general comenzará sin workflow.' : task.entry_workflow_id ? 'Se iniciará el workflow de entrada seleccionado en la tarea. Tu usuario debe tenerlo asignado.' : 'Selecciona el workflow de entrada al editar la tarea antes de tomarla.')}</p>
      {code && <fieldset className="space-y-3" disabled={mutation.busy}>
        <legend className="mb-2 text-sm font-medium">{t('Repositorios de esta tarea')}</legend>
        <p className="text-xs text-base-content/60">{t('Nexora preparará una rama por repositorio desde la base exigida por el workflow. Selecciona únicamente los repositorios que vas a modificar.')}</p>
        <DataMessage loading={data.loading} error={t(data.error)} onRetry={data.reload}/>
        <p className="text-xs text-base-content/60">{t('Selecciona hasta 8 repositorios por tarea.')} {repositories.length}/8</p>
        {choices.map(repo => <label key={repo.id} className="flex items-center gap-3 text-sm"><input type="checkbox" className="checkbox checkbox-sm" checked={repositories.includes(repo.id)} disabled={!repositories.includes(repo.id)&&repositories.length>=8} onChange={event => setRepositories(previous => event.target.checked ? [...previous,repo.id] : previous.filter(id => id !== repo.id))}/><span className="break-all">{repo.remote_full_name ?? repo.requested_full_name ?? repo.id}</span></label>)}
        {data.data && !choices.length && <p className="text-sm text-base-content/60">{t('No hay repositorios autorizados en esta página.')}</p>}
        <div className="flex items-center justify-end gap-1">{cursors.length > 1 && <IconButton label={t('Página anterior')} onClick={() => setCursors(previous => previous.slice(0,-1))}><ChevronLeft size={16}/></IconButton>}{data.data?.next_cursor && <IconButton label={t('Página siguiente')} onClick={() => setCursors(previous => [...previous,data.data!.next_cursor])}><ChevronRight size={16}/></IconButton>}</div>
      </fieldset>}
      {mutation.error && <p role="alert" className="text-sm text-error">{t(mutation.error)}</p>}
      <div className="flex justify-end gap-2"><TextButton type="button" label={t('Cancelar')} onClick={onClose} disabled={mutation.busy}/><TextButton type="submit" label={t('Tomar tarea')} variant="primary" disabled={mutation.busy || !ready}/></div>
    </form>
  </IntegrationDialog>
}
