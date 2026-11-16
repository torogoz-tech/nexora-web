import { useState } from 'react'
import { Link2, X } from 'lucide-react'
import { useTranslation } from '../hooks/useTranslation'
import { useApiData } from '../hooks/useApiData'
import { parseOvertimeEvidence } from '../utils/parseOvertimeEvidence'
import type { OvertimeEvidenceFormProps } from '../types/OvertimeEvidenceFormProps'
import IntegrationDialog from './IntegrationDialog'
import OvertimeEvidencePicker from './OvertimeEvidencePicker'
import TextButton from './TextButton'
import DataMessage from './DataMessage'
export default function OvertimeEvidenceForm({ id, busy, error, onClose, onSubmit }: OvertimeEvidenceFormProps) {
  const { t } = useTranslation()
  const remote = useApiData(`/api/v1/overtime/${encodeURIComponent(id)}/evidence-candidates`, parseOvertimeEvidence)
  const [tasks, setTasks] = useState<string[]>([])
  const [commits, setCommits] = useState<string[]>([])
  return <IntegrationDialog title={t('Vincular evidencias')} busy={busy} onClose={onClose}>
    <form className="space-y-4" onSubmit={event => { event.preventDefault(); if (!busy && remote.data?.can_attach_evidence && (tasks.length || commits.length)) void onSubmit({ ...(tasks.length ? { task_ids: tasks } : {}), source_event_ids: commits }) }}>
      <p className="text-sm text-base-content/55">{t('Vincula tareas y commits recibidos durante el intervalo aprobado o solicitado. Las evidencias existentes se conservan.')}</p>
      {!remote.data ? <DataMessage loading={remote.loading} error={remote.error} onRetry={remote.reload} /> : !remote.data.can_attach_evidence ? <p role="alert" className="text-sm text-error">{t('No tienes permiso para realizar esta acción.')}</p> : <OvertimeEvidencePicker data={remote.data} taskIds={tasks} commitIds={commits} busy={busy} onTasks={setTasks} onCommits={setCommits} />}
      {error && <p role="alert" className="text-sm text-error">{t(error)}</p>}
      <div className="flex justify-end gap-2"><TextButton label={t('Cancelar')} type="button" onClick={onClose} disabled={busy}><X size={16} /></TextButton><TextButton label={t('Vincular evidencias')} variant="primary" type="submit" disabled={busy || !remote.data?.can_attach_evidence || (!tasks.length && !commits.length)}><Link2 size={16} /></TextButton></div>
    </form>
  </IntegrationDialog>
}
