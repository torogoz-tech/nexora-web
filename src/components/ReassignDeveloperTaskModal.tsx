import { useState } from 'react'
import { UserRoundPen, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { parseTaskPoolOptions } from '../utils/parseTaskPoolOptions'
import { mutatePoolTask } from '../services/mutatePoolTask'
import IntegrationDialog from './IntegrationDialog'
import Dropdown from './Dropdown'
import TextButton from './TextButton'
import DataMessage from './DataMessage'
import type { ReassignDeveloperTaskModalProps } from '../types/ReassignDeveloperTaskModalProps'
export default function ReassignDeveloperTaskModal({ task, onClose, onChanged }: ReassignDeveloperTaskModalProps) {
  const { t } = useTranslation(), mutation = useIntegrationMutation()
  const [actor, setActor] = useState(task.assignee_id ?? ''), [reason, setReason] = useState('')
  const options = useApiData(`/api/v1/tasks/options${task.project_id ? `?project_id=${encodeURIComponent(task.project_id)}` : ''}`, parseTaskPoolOptions)
  return <IntegrationDialog title={t('Cambiar responsable')} onClose={onClose} busy={mutation.busy}>
    <p className="mb-4 break-words text-sm text-base-content/60">{task.title} · {task.project_name ?? t('Sin proyecto')}</p>
    {task.lifecycle === 'active' && <p className="mb-4 text-xs text-base-content/60">{t('Cambiar o quitar el responsable devuelve la tarea a pendientes. El nuevo responsable deberá tomarla para iniciar su workflow.')}</p>}
    <form className="space-y-4" onSubmit={event => { event.preventDefault(); if (actor === (task.assignee_id ?? '') || (!!task.assignee_id && !reason.trim())) return; void mutation.run({ task: task.id, revision: task.revision, actor, reason }, async (signal, key) => { await mutatePoolTask(task, 'assign', actor || null, key, signal, reason); onChanged(); onClose() }) }}>
      <label className="flex flex-col gap-2 text-xs">{t('Responsable')}<Dropdown label={t('Nuevo responsable')} value={actor} onChange={setActor} disabled={mutation.busy || options.loading || !!options.error} options={[{ value: '', label: t('Sin responsable') }, ...(options.data?.assignees ?? []).map(person => ({ value: person.actor_id, label: person.name }))]}/></label>
      {task.assignee_id&&<label className="flex flex-col gap-2 text-xs">{t('Motivo')}<textarea className="textarea w-full" aria-label={t('Motivo de la reasignación')} value={reason} onChange={event => setReason(event.target.value)} disabled={mutation.busy} maxLength={1000} required/></label>}
      {options.error && <DataMessage error={t(options.error)} onRetry={options.reload}/>}
      {mutation.error && <p role="alert" className="text-sm text-error">{t(mutation.error)}</p>}
      <footer className="flex justify-end gap-2"><TextButton type="button" label={t('Cancelar')} disabled={mutation.busy} onClick={onClose}><X size={16}/></TextButton><TextButton type="submit" label={t('Guardar responsable')} variant="primary" disabled={mutation.busy || options.loading || !!options.error || actor === (task.assignee_id ?? '') || (!!task.assignee_id && !reason.trim())}><UserRoundPen size={16}/></TextButton></footer>
    </form>
  </IntegrationDialog>
}
