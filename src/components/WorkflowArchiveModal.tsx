import { useTranslation } from '../hooks/useTranslation'
import TextButton from './TextButton'
import { X, Archive, ArchiveRestore } from 'lucide-react'
import { useState } from 'react'
import { useIntegrationMutation as useApiMutation } from '../hooks/useIntegrationMutation'
import { mutateWorkflow } from '../services/mutateWorkflow'
import { parseWorkflowDefinition } from '../utils/parseWorkflowDefinition'
import IntegrationDialog from './IntegrationDialog'
import type { WorkflowArchiveModalProps } from '../types/WorkflowArchiveModalProps'
export default function WorkflowArchiveModal({
  workflow,
  onClose,
  onChanged,
}: WorkflowArchiveModalProps) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')
  const mutation = useApiMutation()
  return (
    <IntegrationDialog
      title={`${workflow.archived ? t('Restaurar') : t('Archivar')} workflow`}
      onClose={onClose}
      busy={mutation.busy}
    >
      <p className="mb-4 text-sm text-base-content/60">
        {workflow.archived
          ? t('El workflow volverá a estar disponible para editar y publicar.')
          : t(
              'El borrador dejará de estar disponible para nuevas publicaciones. Las versiones publicadas se conservan.',
            )}
      </p>
      <label className="flex flex-col gap-2 text-sm">
        {' '}
        {t('Motivo')}{' '}
        <input
          className="input w-full"
          value={reason}
          maxLength={1000}
          disabled={mutation.busy}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>
      {mutation.error && (
        <p role="alert" className="mt-4 text-sm text-error">
          {t(mutation.error)}
        </p>
      )}
      <div className="mt-5 flex justify-end gap-2">
        <TextButton
          type="button"
          variant="ghost"
          disabled={mutation.busy}
          onClick={onClose}
          label={t('Cancelar')}
        >
          <X size={16} aria-hidden="true" />
        </TextButton>
        <TextButton
          type="button"
          variant="primary"
          disabled={mutation.busy || !reason.trim()}
          onClick={() =>
            void mutation.run(
              {
                id: workflow.id,
                revision: workflow.revision,
                reason,
                archived: !workflow.archived,
              },
              async (signal, key) => {
                const value = await mutateWorkflow(
                  `/api/v1/workflows/${encodeURIComponent(workflow.id)}`,
                  'PATCH',
                  {
                    expected_revision: workflow.revision,
                    archived: !workflow.archived,
                    reason: reason.trim(),
                  },
                  key,
                  signal,
                )
                onChanged(parseWorkflowDefinition(value))
                onClose()
              },
            )
          }
          label={
            mutation.busy
              ? t('Guardando…')
              : workflow.archived
                ? t('Restaurar')
                : t('Archivar')
          }
          aria-busy={mutation.busy}
        >
          {workflow.archived ? (
            <ArchiveRestore size={16} aria-hidden="true" />
          ) : (
            <Archive size={16} aria-hidden="true" />
          )}
        </TextButton>
      </div>
    </IntegrationDialog>
  )
}
