import { useTranslation } from '../hooks/useTranslation'
import TextButton from './TextButton'
import { X, Unlink } from 'lucide-react'
import { useState } from 'react'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { removeDeveloperWorkflow } from '../services/removeDeveloperWorkflow'
import IntegrationDialog from './IntegrationDialog'
import type { DeveloperWorkflowRemovalModalProps } from '../types/DeveloperWorkflowRemovalModalProps'
export default function DeveloperWorkflowRemovalModal({
  assignment,
  onClose,
  onRemoved,
}: DeveloperWorkflowRemovalModalProps) {
  const { t } = useTranslation()
  const [reason, setReason] = useState(''),
    mutation = useIntegrationMutation()
  return (
    <IntegrationDialog
      title={t('Desvincular desarrollador')}
      busy={mutation.busy}
      onClose={onClose}
    >
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (!reason.trim()) return
          void mutation.run(
            {
              actor: assignment.actor_id,
              revision: assignment.revision,
              reason,
            },
            async (signal, key) => {
              await removeDeveloperWorkflow(assignment, reason, key, signal)
              onRemoved()
              onClose()
            },
          )
        }}
      >
        <p className="text-sm leading-relaxed text-base-content/60">
          {assignment.actor_name}{' '}
          {t(
            'dejará de estar vinculado a este workflow. Sus tareas deben estar archivadas o reasignadas; el historial se conserva.',
          )}{' '}
        </p>
        <label className="flex flex-col gap-2 text-xs">
          {' '}
          {t('Motivo')}{' '}
          <textarea
            className="textarea w-full"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            required
            maxLength={1000}
            disabled={mutation.busy}
          />
        </label>
        {mutation.error && (
          <p role="alert" className="text-sm text-error">
            {t(mutation.error)}
          </p>
        )}
        <div className="flex justify-end gap-2">
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
            type="submit"
            variant="primary"
            disabled={mutation.busy || !reason.trim()}
            label={mutation.busy ? t('Desvinculando…') : t('Desvincular')}
            aria-busy={mutation.busy}
          >
            <Unlink size={16} aria-hidden="true" />
          </TextButton>
        </div>
      </form>
    </IntegrationDialog>
  )
}
