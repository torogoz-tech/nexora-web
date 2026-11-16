import { useTranslation } from '../hooks/useTranslation'
import TextButton from './TextButton'
import { X, Save, Send } from 'lucide-react'
import { useState } from 'react'
import IntegrationDialog from './IntegrationDialog'
import type { WorkflowReasonModalProps } from '../types/WorkflowReasonModalProps'
export default function WorkflowReasonModal({
  action,
  busy,
  error,
  onClose,
  onConfirm,
}: WorkflowReasonModalProps) {
  const { t } = useTranslation()
  const [reason, setReason] = useState('')
  const publishing = action === 'publish'
  const title = publishing ? t('Publicar versión') : t('Guardar borrador')
  return (
    <IntegrationDialog title={title} busy={busy} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          if (!busy && reason.trim()) void onConfirm(reason)
        }}
      >
        <p className="mb-4 text-sm leading-relaxed text-base-content/60">
          {publishing
            ? t(
                'Explica por qué esta versión está lista para usarse. Publicar crea una versión fija; los recursos existentes conservan su versión actual.',
              )
            : t(
                'Explica por qué modificas el borrador. Guardar registra los cambios, sin publicar una nueva versión.',
              )}
        </p>
        <label className="flex flex-col gap-2 text-sm">
          {publishing ? t('Motivo de publicación') : t('Motivo del cambio')}
          <textarea
            className="textarea min-h-24 w-full"
            required
            maxLength={1000}
            value={reason}
            disabled={busy}
            onChange={(event) => setReason(event.target.value)}
          />
        </label>
        {error && (
          <p role="alert" className="mt-4 text-sm text-error">
            {t(error)}
          </p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <TextButton
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={onClose}
            label={t('Cancelar')}
          >
            <X size={16} aria-hidden="true" />
          </TextButton>
          <TextButton
            type="submit"
            variant="primary"
            disabled={busy || !reason.trim()}
            label={
              busy ? (publishing ? t('Publicando…') : t('Guardando…')) : title
            }
            aria-busy={busy}
          >
            {publishing ? (
              <Send size={16} aria-hidden="true" />
            ) : (
              <Save size={16} aria-hidden="true" />
            )}
          </TextButton>
        </div>
      </form>
    </IntegrationDialog>
  )
}
