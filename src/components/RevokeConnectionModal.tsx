import { useTranslation } from '../hooks/useTranslation'
import TextButton from './TextButton'
import { X, Unplug } from 'lucide-react'
import IntegrationDialog from './IntegrationDialog'
import { useIntegrationMutation } from '../hooks/useIntegrationMutation'
import { integrationRequest } from '../services/integrationRequest'
import type { RevokeConnectionModalProps } from '../types/RevokeConnectionModalProps'
export default function RevokeConnectionModal({
  connection,
  onClose,
  onRevoked,
}: RevokeConnectionModalProps) {
  const { t } = useTranslation()
  const mutation = useIntegrationMutation()
  return (
    <IntegrationDialog
      title={t('Revocar conexión')}
      busy={mutation.busy}
      onClose={onClose}
    >
      <p className="text-sm leading-relaxed text-base-content/60">
        {' '}
        {t('Se revocará el acceso de Nexora mediante la cuenta')}{' '}
        <strong className="text-base-content">{connection.remote_login}</strong>{' '}
        {t(
          '. Los repositorios vinculados perderán su autorización. Para volver a usarla tendrás que conectar la cuenta de nuevo.',
        )}{' '}
      </p>
      {mutation.error && (
        <p role="alert" className="mt-4 text-sm text-error">
          {t(mutation.error)}
        </p>
      )}
      <div className="mt-6 flex justify-end gap-2">
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
          variant="error"
          disabled={mutation.busy}
          onClick={() =>
            void mutation.run(
              { revoke: connection.id },
              async (signal, key) => {
                await integrationRequest(
                  `/api/v1/git/connections/${encodeURIComponent(connection.id)}`,
                  'DELETE',
                  undefined,
                  key,
                  signal,
                )
                onRevoked()
                onClose()
              },
            )
          }
          label={mutation.busy ? t('Revocando…') : t('Revocar conexión')}
          aria-busy={mutation.busy}
        >
          <Unplug size={16} aria-hidden="true" />
        </TextButton>
      </div>
    </IntegrationDialog>
  )
}
